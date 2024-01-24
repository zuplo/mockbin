import { useMemo, useRef, useState } from "react";
import { useCombobox } from "downshift";
import { matchSorter } from "match-sorter";
import cn from "classnames";

import { Header } from "./HeadersList";
import Input from "@/components/Input";
import TrashIcon from "@/components/TrashIcon";
import { CommonHeaders } from "@/utils/commonHeaders";
import ArrowIcon from "@/components/ArrowIcon";

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
  const valueRef = useRef<HTMLInputElement | null>(null);

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

  const onChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isValid = validateValue(e.target.value);
    onChange({ ...header, value: e.target.value, hasError: !isValid });
  };

  const onClickDelete = () => {
    onDelete?.(header.id);
  };
  const [inputValue, setInputValue] = useState(header.key);

  const filteredHeaders = useMemo(
    () => matchSorter(CommonHeaders, inputValue, {}),
    [inputValue],
  );

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    getToggleButtonProps,
    highlightedIndex,
  } = useCombobox({
    items: filteredHeaders,
    initialInputValue: inputValue,
    onSelectedItemChange: ({ selectedItem }) => {
      if (!selectedItem) return;
      onChange({ ...header, key: selectedItem });
      setInputValue(selectedItem);
      valueRef.current?.focus();
      valueRef.current?.select();
    },
    onInputValueChange: ({ inputValue }) => {
      if (!inputValue) return;
      onChange({ ...header, key: inputValue });
      setInputValue(inputValue);
    },
  });

  return (
    <div className="flex align-top items-start gap-2 flex-wrap sm:flex-nowrap">
      <div className="w-full flex flex-col relative">
        <Input placeholder="Key" title="Header key" {...getInputProps()} />
        <button
          type="button"
          className="absolute right-1 text-slate-600 top-0 bottom-0 flex items-center"
          {...getToggleButtonProps()}
        >
          <ArrowIcon className="rotate-90" />
        </button>
        <ul
          className={cn(
            !isOpen && "hidden",
            "absolute z-10 top-full max-h-[200px] overflow-y-auto translate-y-1 w-full bg-slate-800 rounded-md",
          )}
          {...getMenuProps()}
        >
          {isOpen &&
            filteredHeaders.map((item, index) => (
              <li
                className={cn(
                  "p-2 cursor-pointer font-mono text-xs",
                  highlightedIndex === index && "bg-slate-700",
                )}
                key={`${item}-${index}`}
                {...getItemProps({ item, index })}
              >
                {item}
              </li>
            ))}
        </ul>
        {keyError ? (
          <p className="mt-2 text-sm text-red-600">&nbsp;{keyError}</p>
        ) : null}
      </div>
      <div className="w-full flex flex-col mt-4 sm:mt-0">
        <Input
          value={header.value}
          onChange={onChangeValue}
          placeholder="Value"
          ref={valueRef}
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
