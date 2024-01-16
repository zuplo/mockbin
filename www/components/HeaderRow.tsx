import { useState } from "react";
import { Header } from "./HeadersList";
import Input from "@/components/Input";
import TrashIcon from "@/components/TrashIcon";

interface HeaderRowProps {
  header: Header;
  canBeDeleted: boolean;
  headerKeys: string[];
  onChange: (header: Header) => void;
  onDelete?: (id: string) => void;
}

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
    <div className="flex align-top items-start gap-2 flex-wrap sm:flex-nowrap">
      <div className="w-full flex flex-col">
        <Input
          value={header.key}
          placeholder="Key"
          title={"Header key"}
          onChange={onChangeKey}
        />
        {keyError ? (
          <p className="mt-2 text-sm text-red-600">&nbsp;{keyError}</p>
        ) : null}
      </div>
      <div className="w-full flex flex-col mt-4 sm:mt-0">
        <Input
          value={header.value}
          onChange={onChangeValue}
          placeholder="Value"
        />
        {valueError ? (
          <p className="mt-2 text-sm text-red-600">&nbsp;{valueError}</p>
        ) : null}
      </div>
      <button
        className="p-1 translate-y-[2px] enabled:hover:bg-gray-400 dark:enabled:hover:bg-slate-800 rounded transition-all disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        onClick={onClickDelete}
        disabled={!canBeDeleted}
      >
        <TrashIcon />
      </button>
    </div>
  );
};

export default HeaderRow;
