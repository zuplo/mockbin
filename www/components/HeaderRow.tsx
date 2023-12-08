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
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z"
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
          className="text-white bg-[#000019] border font-mono p-1 px-2 border-gray-300 rounded-md"
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
          className="text-white bg-[#000019] border font-mono p-1 px-2 border-gray-300 rounded-md"
          onChange={onChangeValue}
          placeholder="Value"
        />
        {valueError ? (
          <p className="mt-2 text-sm text-red-600">&nbsp;{valueError}</p>
        ) : null}
      </div>
      <button
        className="p-1 my-1 px-1 -mr-2 enabled:hover:bg-gray-400 dark:enabled:hover:bg-gray-400 rounded transition-all disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:text-black"
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
