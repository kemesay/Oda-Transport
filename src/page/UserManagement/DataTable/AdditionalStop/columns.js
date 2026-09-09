import React from "react";

export const columns = [
  {
    accessorKey: "stopType",
    header: "Stop Type",
    editVariant: "select",
    editSelectOptions: ["Oneway", "Roundtrip"],
    muiEditTextFieldProps: {
      required: true,
      helperText: "Which trip type this stop applies to",
    },
  },
  {
    accessorKey: "additionalStopPrice",
    header: "Additional Stop Price",
    Cell: ({ cell, row }) => {
      const value = Number(cell.getValue());
      const currency = row.original.currency || "USD";
      return Number.isFinite(value)
        ? `${currency} $${value.toFixed(2)}`
        : cell.getValue();
    },
    muiEditTextFieldProps: {
      required: true,
      type: "number",
      inputProps: { step: "0.01", min: 0 },
    },
  },
  {
    accessorKey: "currency",
    header: "Currency",
    editVariant: "select",
    editSelectOptions: ["USD"],
    Cell: ({ cell }) => cell.getValue() || "USD",
  },
];
