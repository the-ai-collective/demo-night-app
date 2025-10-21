import { parse } from "csv-parse";
import { ArrowDownToLine, ArrowUpFromLine, FileText } from "lucide-react";
import { useState } from "react";
import { CSVLink } from "react-csv";
import { type CommonPropTypes } from "react-csv/components/CommonPropTypes";
import { useDropzone } from "react-dropzone";

import { cn } from "~/lib/utils";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

type CsvButtonProps<T extends string> = CommonPropTypes & {
  style?: "default" | "minimal";
  headers: T[];
  onUpload: (rows: Record<T, string>[]) => void;
};

export default function CsvButton<T extends string>(props: CsvButtonProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        className={cn(
          "group flex flex-row items-center gap-1.5",
          props.style === "minimal" && "py-1 text-sm",
        )}
        title="Edit via CSV"
        onClick={() => setOpen(true)}
      >
        <FileText className="size-4" />
        CSV
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[320px]">
          <DialogHeader>
            <DialogTitle>Edit via CSV</DialogTitle>
          </DialogHeader>
          <CsvModalContent {...props} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function CsvModalContent<T extends string>(
  props: CsvButtonProps<T> & { onClose: () => void },
) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (file.type !== "text/csv") {
        alert("Please upload a CSV file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        parse(
          text as string,
          {
            columns: true,
            delimiter: ",",
          },
          (err, records) => {
            if (err) {
              alert(err);
              return;
            }
            props.onUpload(records);
            props.onClose();
          },
        );
      };
      reader.readAsText(file);
    },
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <CSVLink
        className="w-full"
        data={props.data}
        headers={props.headers}
        filename={props.filename}
      >
        <Button
          variant="secondary"
          className="flex w-full flex-row items-center justify-center gap-1"
        >
          <ArrowDownToLine className="h-[14px] w-[14px]" strokeWidth={3} />
          Download CSV
        </Button>
      </CSVLink>
      <div
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-3 py-4 text-center font-medium text-muted-foreground transition-all duration-300 hover:text-gray-500",
          isDragActive && "border-gray-400 bg-gray-100",
        )}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <p className="flex flex-row items-center gap-1">
          <ArrowUpFromLine className="h-[14px] w-[14px]" strokeWidth={3} />{" "}
          {isDragActive ? "Drop CSV here" : "Upload CSV"}
        </p>
        <p className="text-xs italic text-green-500">
          WARNING: overwrites existing rows!
        </p>
        <p className="text-sm text-muted-foreground">
          (columns: {props.headers?.join(", ")})
        </p>
      </div>
      <Button variant="default" className="w-full" onClick={props.onClose}>
        Done
      </Button>
    </div>
  );
}
