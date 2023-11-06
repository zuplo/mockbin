import { v4 } from "uuid";
import HeaderRow from "./HeaderRow";

export type Header = {
  key: string;
  value: string;
  hasError: boolean;
  id: string;
};

interface HeaderListProps {
  headers: Header[];
  onChange: (headers: Header[]) => void;
}

export const getDefaultEditorHeader = (): Header => {
  return {
    key: "",
    value: "",
    hasError: true, // Ensures header will be ignored until edited
    id: v4(),
  };
};

const HeadersList = ({ headers, onChange }: HeaderListProps) => {
  const onChangeHeader = (newHeader: Header) => {
    const newHeaders = headers.map((header) =>
      header.id === newHeader.id ? newHeader : header,
    );
    const lastHeader = newHeaders.at(newHeaders.length - 1);
    if (lastHeader && !(lastHeader.key === "" && lastHeader.value === "")) {
      // Prefill a new row for the user to type more headers
      newHeaders.push(getDefaultEditorHeader());
    }
    onChange(newHeaders);
  };

  const onDeleteHeader = (id: string) => {
    const newHeaders = headers.filter((header) => header.id !== id);

    onChange(newHeaders);
  };

  return (
    <div className="flex flex-col gap-y-4 w-full">
      {headers.map((header, index) => (
        <HeaderRow
          header={header}
          headerKeys={headers.map((header) => header.key)}
          onChange={onChangeHeader}
          onDelete={onDeleteHeader}
          canBeDeleted={index !== headers.length - 1}
          key={header.id}
        />
      ))}
    </div>
  );
};

export default HeadersList;
