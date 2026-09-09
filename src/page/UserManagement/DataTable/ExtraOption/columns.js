import React from "react";

export const columns = [
  {
    accessorKey: "name",
    header: "Extra Option Name",
    muiEditTextFieldProps: { required: true },
  },
  {
    accessorKey: "description",
    header: "Description",
    muiEditTextFieldProps: { required: true, multiline: true },
  },
  {
    accessorKey: "pricePerItem",
    header: "Price per Item",
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
  {
    accessorKey: "hasMaxAllowedLimit",
    header: "Has Max Allowed Limit",
    editVariant: "select",
    editSelectOptions: [
      { value: true, text: "Yes" },
      { value: false, text: "No" },
    ],
    Cell: ({ cell }) => (cell.getValue() ? "Yes" : "No"),
  },
  {
    accessorKey: "maxAllowedItems",
    header: "Max Allowed Items",
    muiEditTextFieldProps: {
      type: "number",
      inputProps: { min: 0 },
      helperText: "Required only when \"Has Max Allowed Limit\" is Yes",
    },
  },
];
