import { useState } from "react";
import { Header } from "./HeadersList";

interface HeaderRowProps {
  header: Header;
  canBeDeleted: boolean;
  headerKeys: string[];
  onChange: (header: Header) => void;
  onDelete?: (id: string) => void;
}

const TrashIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const HeaderRow = ({
  header,
  headerKeys,
  canBeDeleted,
  onChange,
  onDelete,
}: HeaderRowProps) => {
  const [keyError, setKeyError] = useState<string | undefined>();
  const [valueError, setValueError] = useState<string | undefined>();

  const validateKey = (newKey: string) => {
    // Empty key validation
    if (newKey.length === 0) {
      setKeyError("Key cannot be empty");
      return false;
    }

    // Repeated Key validation
    const keyCount = headerKeys.reduce((count, headerKey) => {
      if (headerKey === newKey) {
        return count + 1;
      }
      return count;
    }, 0);
    if (keyCount >= 1) {
      setKeyError("Key cannot be repeated");
      return false;
    }

    // White space validation
    const containsWhiteSpaceInKey = newKey.includes(" ");
    if (containsWhiteSpaceInKey) {
      setKeyError("Key cannot contain whitespace");
      return false;
    }

    setKeyError(undefined);
    return true;
  };

  const validateValue = (newValue: string) => {
    // Empty value validation
    if (newValue.length === 0) {
      setValueError(undefined);
      return true;
    }

    return true;
  };

  const onChangeKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isValid = validateKey(e.target.value);
    onChange({ ...header, key: e.target.value, hasError: !isValid });
  };

  const onChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isValid = validateValue(e.target.value);
    onChange({ ...header, value: e.target.value, hasError: !isValid });
  };

  const onClickDelete = () => {
    onDelete?.(header.id);
  };

  return (
    <div className="flex align-top items-start flex-wrap sm:flex-nowrap">
      <div className="w-full flex flex-col">
        <input
          value={header.key}
          placeholder="Key"
          className="text-black border-2 font-mono p-1 px-2 border-gray-300 rounded-md"
          title={"Header key"}
          onChange={onChangeKey}
        />
        {keyError ? (
          <p className="mt-2 text-sm text-red-600">&nbsp;{keyError}</p>
        ) : null}
      </div>
      <div className="w-full flex flex-col sm:pl-3 sm:pr-2 mt-4 sm:mt-0">
        <input
          value={header.value}
          className="text-black border-2 font-mono p-1 px-2 border-gray-300 rounded-md"
          onChange={onChangeValue}
          placeholder="Value"
        />
        {valueError ? (
          <p className="mt-2 text-sm text-red-600">&nbsp;{valueError}</p>
        ) : null}
      </div>
      <button
        className="p-1 my-1 px-1 -mr-2 enabled:hover:bg-gray-200 dark:enabled:hover:bg-gray-500 rounded disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onClickDelete}
        disabled={!canBeDeleted}
        title="Delete header"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default HeaderRow;
