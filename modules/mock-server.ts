import { OpenAPIV3 } from "openapi-types";

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
        return this.problemDetailsResponse(
          404,
          "Not Found",
          `No matching operation for ${request.method} ${request.url}`,
        );
      }

      // Validate required parameters and their types
      const paramValidationErrors = this.validateParameters(
        request,
        operationInfo,
      );
      if (paramValidationErrors.length > 0) {
        return this.problemDetailsResponse(
          400,
          "Bad Request",
          "Invalid parameters",
          paramValidationErrors,
        );
      }

      // Validate required request body
      const bodyValidationErrors = await this.validateRequestBody(
        request,
        operationInfo,
      );
      if (bodyValidationErrors.length > 0) {
        return this.problemDetailsResponse(
          400,
          "Bad Request",
          "Invalid request body",
          bodyValidationErrors,
        );
      }

      // Generate response
      const { responseBody, contentType, statusCode } = this.generateResponse(
        operationInfo,
        request,
      );

      if (responseBody === null) {
        return this.problemDetailsResponse(
          500,
          "Internal Server Error",
          "Unable to Mock. No mockable information found for this path.",
        );
      }

      return new Response(responseBody, {
        status: statusCode,
        headers: { "Content-Type": contentType },
      });
    } catch (error: any) {
      return this.problemDetailsResponse(
        500,
        "Internal Server Error",
        error.message,
      );
    }
  }

  private matchOperation(request: Request): any {
    const url = new URL(request.url);
    const requestPath = url.pathname;
    const requestMethod = request.method.toLowerCase() as OpenAPIV3.HttpMethods;

    for (const [pathPattern, pathItem] of Object.entries(
      this.openApiDoc.paths,
    )) {
      const typedPathItem = pathItem as OpenAPIV3.PathItemObject;
      const pathRegex = this.pathPatternToRegex(pathPattern);
      const match = requestPath.match(pathRegex);

      if (match && typedPathItem[requestMethod]) {
        const operation = typedPathItem[
          requestMethod
        ] as OpenAPIV3.OperationObject;
        const pathParams = this.extractPathParams(pathPattern, requestPath);
        return {
          operation,
          pathParams,
        };
      }
    }
    // Handle no match found...
  }

  private pathPatternToRegex(pathPattern: string): RegExp {
    const escapedPattern = pathPattern.replace(
      /([.+?^=!:${}()|\[\]/\\])/g,
      "\\$1",
    );
    const regexPattern =
      "^" + escapedPattern.replace(/\\\{([^}]+)\\\}/g, "(?<$1>[^/]+)") + "$";
    return new RegExp(regexPattern);
  }

  private extractPathParams(
    pathPattern: string,
    requestPath: string,
  ): {
    [key: string]: string;
  } {
    const patternParts = pathPattern.split("/");
    const pathParts = requestPath.split("/");
    const params: { [key: string]: string } = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];
      if (patternPart.startsWith("{") && patternPart.endsWith("}")) {
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
          case "query":
            const url = new URL(request.url);
            paramValue = url.searchParams.get(paramName);
            break;
          case "header":
            paramValue = request.headers.get(paramName);
            break;
          case "path":
            paramValue = pathParams[paramName];
            break;
          case "cookie":
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

        // Validate type and enum
        const validationErrors = this.validateSchema(
          paramValue,
          schema,
          paramName,
          true,
        );
        errors.push(...validationErrors);
      }
    }

    return errors;
  }

  private convertParameterValue(value: string, type: string): any {
    switch (type) {
      case "integer":
        const intVal = parseInt(value, 10);
        return isNaN(intVal) ? value : intVal;
      case "number":
        const floatVal = parseFloat(value);
        return isNaN(floatVal) ? value : floatVal;
      case "boolean":
        if (value === "true" || value === "1") return true;
        if (value === "false" || value === "0") return false;
        return value;
      case "array":
        return value.split(",");
      default:
        return value;
    }
  }

  private async validateRequestBody(
    request: Request,
    operationInfo: any,
  ): Promise<string[]> {
    const { operation } = operationInfo;
    const errors: string[] = [];

    if (operation.requestBody) {
      const requestBody = operation.requestBody;
      const contentTypes = Object.keys(requestBody.content || {});

      // Determine the Content-Type to use
      let contentType = request.headers.get("Content-Type");
      if (!contentType && contentTypes.length >= 1) {
        // Assume the first available content type
        contentType = contentTypes[0];
      }

      // Trim any charset or additional parameters
      contentType = contentType?.split(";")[0].trim() ?? null;

      let requestBodyText: string;
      try {
        requestBodyText = await request.text();
      } catch (e) {
        errors.push("Unable to read request body");
        return errors;
      }

      if (!requestBodyText && requestBody.required) {
        errors.push("Missing request body");
        return errors;
      }

      if (requestBodyText) {
        let mediaType = contentType
          ? requestBody.content[contentType]
          : undefined;

        if (!mediaType) {
          const contentTypes = Object.keys(requestBody.content);
          if (contentTypes.length === 1) {
            contentType = contentTypes[0];
            mediaType = requestBody.content[contentType];
          } else {
            errors.push("Missing or unsupported content type");
            return errors;
          }
        }

        if (mediaType.schema) {
          let requestBodyData: any = requestBodyText;
          const schema = this.resolveRef(mediaType.schema);

          if (contentType?.includes("application/json")) {
            try {
              requestBodyData = JSON.parse(requestBodyText);
            } catch (e) {
              errors.push("Invalid JSON in request body");
              return errors;
            }
          }

          const validationErrors = this.validateSchema(requestBodyData, schema);
          errors.push(...validationErrors);
        }
      }
    }

    return errors;
  }

  private resolveRef(obj: any): any {
    if (!obj || !obj.$ref) {
      return obj;
    }

    const refPath = obj.$ref;
    const parts = refPath.replace(/^#\//, "").split("/"); // Remove initial '#/' and split
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

  private validateSchema(
    data: any,
    schema: any,
    path: string = "",
    isParameter: boolean = false,
  ): string[] {
    const errors: string[] = [];

    schema = this.resolveRef(schema);

    let originalData = data;

    if (isParameter) {
      // Attempt to convert the data to the expected type
      const convertedData = this.convertParameterValue(data, schema.type);
      if (convertedData !== data) {
        data = convertedData;
      }
    }

    if (schema.type) {
      if (!this.validateType(data, schema.type)) {
        errors.push(
          `Expected type '${
            schema.type
          }' at path '${path}', but got '${typeof originalData}'`,
        );
        return errors;
      }
    }

    if (schema.enum) {
      if (!schema.enum.includes(data)) {
        errors.push(
          `Value '${data}' at path '${path}' is not in enum [${schema.enum.join(
            ", ",
          )}]`,
        );
      }
    }

    if (schema.type === "object") {
      if (schema.required && Array.isArray(schema.required)) {
        for (const propName of schema.required) {
          if (data[propName] === undefined) {
            errors.push(
              `Missing required field '${path ? path + "." : ""}${propName}'`,
            );
          }
        }
      }

      if (schema.properties) {
        for (const [propName, propSchema] of Object.entries(
          schema.properties,
        )) {
          const resolvedPropSchema = this.resolveRef(propSchema);
          const propPath = path ? `${path}.${propName}` : propName;
          if (data[propName] !== undefined) {
            errors.push(
              ...this.validateSchema(
                data[propName],
                resolvedPropSchema,
                propPath,
              ),
            );
          }
        }
      }
    } else if (schema.type === "array") {
      if (!Array.isArray(data)) {
        errors.push(
          `Expected an array at path '${path}', but got '${typeof data}'`,
        );
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
      case "string":
        return typeof data === "string";
      case "number":
        return typeof data === "number" && !isNaN(data);
      case "integer":
        return Number.isInteger(data);
      case "boolean":
        return typeof data === "boolean";
      case "object":
        return (
          data !== null && typeof data === "object" && !Array.isArray(data)
        );
      case "array":
        return Array.isArray(data);
      case "null":
        return data === null;
      default:
        return false;
    }
  }

  private generateResponse(
    operationInfo: any,
    request: Request,
  ): { responseBody: any; contentType: string; statusCode: number } {
    const { operation } = operationInfo;
    const responses = operation.responses;

    if (!responses) {
      return { responseBody: null, contentType: "text/plain", statusCode: 500 };
    }

    // Choose a response, prefer 200, else default
    let responseKey = "200";
    if (!responses[responseKey]) {
      responseKey =
        "default" in responses ? "default" : Object.keys(responses)[0];
    }

    const response = responses[responseKey];

    if (!response) {
      return { responseBody: null, contentType: "text/plain", statusCode: 500 };
    }

    const acceptHeader = request.headers.get("Accept") || "*/*";

    const contentTypes = Object.keys(response.content || {});
    const matchedContentType = this.getBestMatchingContentType(
      acceptHeader,
      contentTypes,
    );

    if (!matchedContentType) {
      return {
        responseBody: null,
        contentType: "text/plain",
        statusCode: 406, // Not Acceptable
      };
    }

    const mediaType = response.content[matchedContentType];

    if (!mediaType) {
      return { responseBody: null, contentType: "text/plain", statusCode: 500 };
    }

    // Use examples
    let responseBody: any = null;

    if (mediaType.examples) {
      // Pick a random example
      const examples = Object.values(mediaType.examples);
      const randomExample = examples[
        Math.floor(Math.random() * examples.length)
      ] as any;
      if (randomExample && randomExample.value !== undefined) {
        responseBody = randomExample.value;
      }
    }

    // Use example if examples are not available or responseBody is still null
    if (responseBody === null && mediaType.example !== undefined) {
      responseBody = mediaType.example;
    }

    // Generate from schema if no example is available
    if (responseBody === null && mediaType.schema) {
      const schema = this.resolveRef(mediaType.schema);
      responseBody = this.generateExampleFromSchema(schema);
    }

    // For non-JSON content types, ensure responseBody is a string
    if (
      matchedContentType !== "application/json" &&
      typeof responseBody !== "string"
    ) {
      responseBody = String(responseBody);
    } else if (typeof responseBody !== "string") {
      // For JSON content types, stringify the response body
      responseBody = JSON.stringify(responseBody);
    }

    return {
      responseBody,
      contentType: matchedContentType,
      statusCode: parseInt(responseKey, 10) || 200,
    };
  }

  private getBestMatchingContentType(
    acceptHeader: string,
    availableContentTypes: string[],
  ): string | null {
    if (!acceptHeader || acceptHeader === "*/*") {
      return availableContentTypes[0];
    }

    const acceptTypes = acceptHeader
      .split(",")
      .map((type) => type.split(";")[0].trim());

    // Normalize content types to lowercase
    const normalizedAvailableContentTypes = availableContentTypes.map((ct) =>
      ct.toLowerCase(),
    );

    // First, try to find an exact match
    for (const acceptType of acceptTypes) {
      const normalizedAcceptType = acceptType.toLowerCase();
      const index =
        normalizedAvailableContentTypes.indexOf(normalizedAcceptType);
      if (index !== -1) {
        return availableContentTypes[index];
      }
    }

    // Next, handle wildcard subtypes (e.g., application/*)
    for (const acceptType of acceptTypes) {
      const [acceptMainType, acceptSubType] = acceptType
        .toLowerCase()
        .split("/");
      if (acceptSubType === "*") {
        for (const contentType of normalizedAvailableContentTypes) {
          const [contentMainType] = contentType.split("/");
          if (acceptMainType === contentMainType) {
            return availableContentTypes[
              normalizedAvailableContentTypes.indexOf(contentType)
            ];
          }
        }
      }
    }

    // Lastly, handle wildcard main types (e.g., */*)
    if (acceptTypes.includes("*/*")) {
      return availableContentTypes[0];
    }

    // No matching content type found
    return null;
  }

  private generateExampleFromSchema(schema: any): any {
    if (!schema) return null;

    schema = this.resolveRef(schema);

    // Use 'examples' if available
    if (schema.examples && Array.isArray(schema.examples)) {
      // Pick a random example
      const randomExample =
        schema.examples[Math.floor(Math.random() * schema.examples.length)];
      return randomExample;
    }

    // Use 'example' if 'examples' is not available
    if (schema.example !== undefined) {
      return schema.example;
    }

    if (schema.default !== undefined) {
      return schema.default;
    }

    if (schema.type) {
      switch (schema.type) {
        case "object":
          const obj: any = {};
          if (schema.properties) {
            for (const [propName, propSchema] of Object.entries(
              schema.properties,
            )) {
              const resolvedPropSchema = this.resolveRef(propSchema);
              obj[propName] =
                this.generateExampleFromSchema(resolvedPropSchema);
            }
          }
          return obj;
        case "array":
          if (schema.items) {
            const resolvedItemSchema = this.resolveRef(schema.items);
            return [this.generateExampleFromSchema(resolvedItemSchema)];
          }
          return [];
        case "string":
          if (schema.enum && schema.enum.length > 0) {
            // Pick a random enum value
            return schema.enum[Math.floor(Math.random() * schema.enum.length)];
          }
          if (schema.format) {
            return this.getExampleByFormat(schema.format);
          }
          return "string";
        case "number":
          return 0;
        case "integer":
          return 0;
        case "boolean":
          return true;
        case "null":
          return null;
        default:
          return null;
      }
    }

    if (schema.anyOf && schema.anyOf.length > 0) {
      // Pick a random schema from anyOf
      const randomSchema = this.resolveRef(
        schema.anyOf[Math.floor(Math.random() * schema.anyOf.length)],
      );
      return this.generateExampleFromSchema(randomSchema);
    }

    if (schema.oneOf && schema.oneOf.length > 0) {
      // Pick a random schema from oneOf
      const randomSchema = this.resolveRef(
        schema.oneOf[Math.floor(Math.random() * schema.oneOf.length)],
      );
      return this.generateExampleFromSchema(randomSchema);
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

  private getExampleByFormat(format: string): unknown {
    switch (format) {
      case "date-time":
        return new Date().toISOString();
      case "date":
        return new Date().toISOString().split("T")[0];
      case "email":
        return "user@example.com";
      case "uuid":
        return "123e4567-e89b-12d3-a456-426614174000";
      case "uri":
        return "https://example.com";
      default:
        return "string";
    }
  }

  private problemDetailsResponse(
    status: number,
    title: string,
    detail: string,
    errors?: string[],
  ): Response {
    const problemDetails: ProblemDetails = {
      type: `https://httpproblems.com/http-status/${status}`,
      title,
      status,
      detail,
    };
    if (errors && errors.length > 0) {
      problemDetails.errors = errors;
    }
    return new Response(JSON.stringify(problemDetails), {
      status,
      headers: { "Content-Type": "application/problem+json" },
    });
  }
}

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  errors?: string[];
}
