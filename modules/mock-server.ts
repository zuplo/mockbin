export class MockServer {
	private openApiDoc: any;

	constructor(openApiDoc: any) {
		this.openApiDoc = openApiDoc;
	}

	async handleRequest(request: Request): Promise<Response> {
		try {
			// Match request to operation in OpenAPI
			const operationInfo = this.matchOperation(request);

			if (!operationInfo) {
				return this.problemDetailsResponse(404, 'Not Found', `No matching operation for ${request.method} ${request.url}`);
			}

			// Validate required parameters and their types
			const paramValidationErrors = this.validateParameters(request, operationInfo);
			if (paramValidationErrors.length > 0) {
				return this.problemDetailsResponse(400, 'Bad Request', 'Invalid parameters', paramValidationErrors);
			}

			// Validate required request body
			const bodyValidationErrors = await this.validateRequestBody(request, operationInfo);
			if (bodyValidationErrors.length > 0) {
				return this.problemDetailsResponse(400, 'Bad Request', 'Invalid request body', bodyValidationErrors);
			}

			// Generate response
			const responseBody = this.generateResponse(operationInfo);

			if (responseBody === null) {
				return this.problemDetailsResponse(500, 'Internal Server Error', 'Unable to Mock. No mockable information found for this path.');
			}

			return new Response(JSON.stringify(responseBody), {
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (error: any) {
			return this.problemDetailsResponse(500, 'Internal Server Error', error.message);
		}
	}

	// Rest of the methods (matchOperation, validateParameters, etc.) remain the same,
	// but are now methods of the MockServer class.

	private matchOperation(request: Request): any {
		const url = new URL(request.url);
		const requestPath = url.pathname;
		const requestMethod = request.method.toLowerCase();

		for (const [pathPattern, pathItem] of Object.entries(this.openApiDoc.paths)) {
			const pathRegex = this.pathPatternToRegex(pathPattern);
			const match = requestPath.match(pathRegex);

			if (match) {
				const operation = pathItem[requestMethod];
				if (operation) {
					const pathParams = this.extractPathParams(pathPattern, requestPath);
					return {
						operation,
						pathParams,
					};
				}
			}
		}
		return null;
	}

	private pathPatternToRegex(pathPattern: string): RegExp {
		const escapedPattern = pathPattern.replace(/([.+?^=!:${}()|\[\]/\\])/g, '\\$1');
		const regexPattern = '^' + escapedPattern.replace(/\\\{([^}]+)\\\}/g, '([^/]+)') + '$';
		return new RegExp(regexPattern);
	}

	private extractPathParams(
		pathPattern: string,
		requestPath: string
	): {
		[key: string]: string;
	} {
		const patternParts = pathPattern.split('/');
		const pathParts = requestPath.split('/');
		const params: { [key: string]: string } = {};

		for (let i = 0; i < patternParts.length; i++) {
			const patternPart = patternParts[i];
			const pathPart = pathParts[i];
			if (patternPart.startsWith('{') && patternPart.endsWith('}')) {
				const paramName = patternPart.slice(1, -1);
				params[paramName] = decodeURIComponent(pathPart);
			}
		}
		return params;
	}

	private validateParameters(request: Request, operationInfo: any): string[] {
		const { operation, pathParams } = operationInfo;
		const errors: string[] = [];

		if (operation.parameters) {
			for (const param of operation.parameters) {
				const resolvedParam = this.resolveRef(param);
				const mergedParam = { ...resolvedParam, ...param }; // Merge properties

				const paramName = mergedParam.name;
				const paramIn = mergedParam.in;
				const required = mergedParam.required || false;
				const schema = this.resolveRef(mergedParam.schema);

				let paramValue: any = null;

				switch (paramIn) {
					case 'query':
						const url = new URL(request.url);
						paramValue = url.searchParams.get(paramName);
						break;
					case 'header':
						paramValue = request.headers.get(paramName);
						break;
					case 'path':
						paramValue = pathParams[paramName];
						break;
					case 'cookie':
						// Cookie parameters are not implemented in this example
						break;
					default:
						break;
				}

				if (paramValue == null) {
					if (required) {
						errors.push(`Missing required ${paramIn} parameter '${paramName}'`);
					}
					continue; // Skip further validation if parameter is missing
				}

				// Convert parameter value to appropriate type for validation
				paramValue = this.convertParameterValue(paramValue, schema.type);

				// Validate type and enum
				const validationErrors = this.validateSchema(paramValue, schema, paramName, true);
				errors.push(...validationErrors);
			}
		}

		return errors;
	}

	private convertParameterValue(value: string, type: string): any {
		switch (type) {
			case 'integer':
				return parseInt(value, 10);
			case 'number':
				return parseFloat(value);
			case 'boolean':
				return value === 'true' || value === '1';
			case 'array':
				return value.split(',');
			default:
				return value;
		}
	}

	private async validateRequestBody(request: Request, operationInfo: any): Promise<string[]> {
		const { operation } = operationInfo;
		const errors: string[] = [];

		if (operation.requestBody && operation.requestBody.required) {
			const contentType = request.headers.get('Content-Type') || '';
			if (!contentType.includes('application/json')) {
				errors.push('Invalid or missing Content-Type header');
				return errors;
			}

			let requestBodyText: string;
			try {
				requestBodyText = await request.text();
			} catch (e) {
				errors.push('Unable to read request body');
				return errors;
			}

			if (!requestBodyText) {
				errors.push('Missing request body');
				return errors;
			}

			let requestBodyJson: any;
			try {
				requestBodyJson = JSON.parse(requestBodyText);
			} catch (e) {
				errors.push('Invalid JSON in request body');
				return errors;
			}

			// Get the schema from the OpenAPI document
			const mediaType = operation.requestBody.content['application/json'];
			if (!mediaType || !mediaType.schema) {
				// No schema to validate against
				return errors;
			}

			let schema = this.resolveRef(mediaType.schema);

			// Validate the request body against the schema
			const validationErrors = this.validateSchema(requestBodyJson, schema);
			errors.push(...validationErrors);
		}

		return errors;
	}

	private resolveRef(obj: any): any {
		if (!obj || !obj.$ref) {
			return obj;
		}

		const refPath = obj.$ref;
		const parts = refPath.replace(/^#\//, '').split('/'); // Remove initial '#/' and split
		let refObj = this.openApiDoc;

		for (const part of parts) {
			if (refObj[part] !== undefined) {
				refObj = refObj[part];
			} else {
				throw new Error(`Cannot resolve reference: ${refPath}`);
			}
		}

		if (refObj.$ref) {
			// Recursively resolve nested $ref
			return this.resolveRef(refObj);
		} else {
			return refObj;
		}
	}

	private validateSchema(data: any, schema: any, path: string = '', isParameter: boolean = false): string[] {
		const errors: string[] = [];

		schema = this.resolveRef(schema);

		if (schema.type) {
			if (!this.validateType(data, schema.type)) {
				errors.push(`Expected type '${schema.type}' at path '${path}', but got '${typeof data}'`);
				return errors;
			}
		}

		if (schema.enum) {
			if (!schema.enum.includes(data)) {
				errors.push(`Value '${data}' at path '${path}' is not in enum [${schema.enum.join(', ')}]`);
			}
		}

		if (schema.type === 'object') {
			if (schema.required && Array.isArray(schema.required)) {
				for (const propName of schema.required) {
					if (data[propName] === undefined) {
						errors.push(`Missing required field '${path ? path + '.' : ''}${propName}'`);
					}
				}
			}

			if (schema.properties) {
				for (const [propName, propSchema] of Object.entries(schema.properties)) {
					const resolvedPropSchema = this.resolveRef(propSchema);
					const propPath = path ? `${path}.${propName}` : propName;
					if (data[propName] !== undefined) {
						errors.push(...this.validateSchema(data[propName], resolvedPropSchema, propPath));
					}
				}
			}
		} else if (schema.type === 'array') {
			if (!Array.isArray(data)) {
				errors.push(`Expected an array at path '${path}', but got '${typeof data}'`);
			} else {
				const itemSchema = this.resolveRef(schema.items);
				for (let i = 0; i < data.length; i++) {
					const itemPath = `${path}[${i}]`;
					errors.push(...this.validateSchema(data[i], itemSchema, itemPath));
				}
			}
		}

		return errors;
	}

	private validateType(data: any, expectedType: string): boolean {
		switch (expectedType) {
			case 'string':
				return typeof data === 'string';
			case 'number':
				return typeof data === 'number' && !isNaN(data);
			case 'integer':
				return Number.isInteger(data);
			case 'boolean':
				return typeof data === 'boolean';
			case 'object':
				return data !== null && typeof data === 'object' && !Array.isArray(data);
			case 'array':
				return Array.isArray(data);
			case 'null':
				return data === null;
			default:
				return false;
		}
	}

	private generateResponse(operationInfo: any): any {
		const { operation } = operationInfo;
		const responses = operation.responses;

		// Choose a response, prefer 200, else default
		let response = responses['200'] || responses['default'];
		if (!response) {
			// Pick any response
			response = Object.values(responses)[0];
		}

		if (!response) {
			return null;
		}

		const content = response.content;
		if (content) {
			// Assume application/json
			const mediaType = content['application/json'];
			if (mediaType) {
				if (mediaType.example) {
					return mediaType.example;
				}
				if (mediaType.examples) {
					// Pick first example
					const example = Object.values(mediaType.examples)[0] as any;
					if (example && example.value) {
						return example.value;
					}
				}
				if (mediaType.schema) {
					const schema = this.resolveRef(mediaType.schema);
					return this.generateExampleFromSchema(schema);
				}
			}
		}
		return null;
	}

	private generateExampleFromSchema(schema: any): any {
		if (!schema) return null;

		schema = this.resolveRef(schema);

		if (schema.example !== undefined) {
			return schema.example;
		}

		if (schema.default !== undefined) {
			return schema.default;
		}

		if (schema.type) {
			switch (schema.type) {
				case 'object':
					const obj: any = {};
					if (schema.properties) {
						for (const [propName, propSchema] of Object.entries(schema.properties)) {
							const resolvedPropSchema = this.resolveRef(propSchema);
							obj[propName] = this.generateExampleFromSchema(resolvedPropSchema);
						}
					}
					return obj;
				case 'array':
					if (schema.items) {
						const resolvedItemSchema = this.resolveRef(schema.items);
						return [this.generateExampleFromSchema(resolvedItemSchema)];
					}
					return [];
				case 'string':
					if (schema.enum && schema.enum.length > 0) {
						return schema.enum[0];
					}
					if (schema.format) {
						return this.getExampleByFormat(schema.format);
					}
					return 'string';
				case 'number':
					return 0;
				case 'integer':
					return 0;
				case 'boolean':
					return true;
				case 'null':
					return null;
				default:
					return null;
			}
		}

		if (schema.anyOf && schema.anyOf.length > 0) {
			const resolvedSchema = this.resolveRef(schema.anyOf[0]);
			return this.generateExampleFromSchema(resolvedSchema);
		}

		if (schema.oneOf && schema.oneOf.length > 0) {
			const resolvedSchema = this.resolveRef(schema.oneOf[0]);
			return this.generateExampleFromSchema(resolvedSchema);
		}

		if (schema.allOf && schema.allOf.length > 0) {
			let result = {};
			for (const subSchema of schema.allOf) {
				const resolvedSubSchema = this.resolveRef(subSchema);
				const subResult = this.generateExampleFromSchema(resolvedSubSchema);
				result = { ...result, ...subResult };
			}
			return result;
		}

		return null;
	}

	private getExampleByFormat(format: string): any {
		switch (format) {
			case 'date-time':
				return new Date().toISOString();
			case 'email':
				return 'user@example.com';
			case 'uuid':
				return '123e4567-e89b-12d3-a456-426614174000';
			default:
				return 'string';
		}
	}

	private problemDetailsResponse(status: number, title: string, detail: string, errors?: string[]): Response {
		const problemDetails = {
			type: 'about:blank',
			title,
			status,
			detail,
			errors,
		};
		return new Response(JSON.stringify(problemDetails), {
			status,
			headers: { 'Content-Type': 'application/problem+json' },
		});
	}
}
