import React from "react";
import { Chip } from "@mui/material";

export const columns = [
  {
    accessorKey: "preferenceName",
    header: "Preference Name",
    muiEditTextFieldProps: {
      required: true,
      helperText: "e.g. Meet & Greet, Curbside Pickup",
    },
  },
  {
    accessorKey: "preferencePrice",
    header: "Preference Price",
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
      helperText: "Extra fee charged for this preference",
    },
  },
  {
    accessorKey: "currency",
    header: "Currency",
    editVariant: "select",
    editSelectOptions: ["USD"],
    muiEditTextFieldProps: {
      helperText: "Currently USD-only nationwide",
    },
    Cell: ({ cell }) => cell.getValue() || "USD",
  },
  {
    accessorKey: "status",
    header: "Status",
    editVariant: "select",
    editSelectOptions: ["Active", "Disabled"],
    muiEditTextFieldProps: {
      required: true,
      helperText: "Disabled preferences are hidden from customers",
    },
    Cell: ({ cell }) => {
      const value = cell.getValue() || "Active";
      const isActive = value === "Active";
      return (
        <Chip
          label={value}
          size="small"
          sx={{
            fontWeight: 700,
            color: isActive ? "#03930A" : "#8B1D1D",
            bgcolor: isActive ? "rgba(3,147,10,0.1)" : "rgba(211,47,47,0.1)",
            border: `1px solid ${isActive ? "rgba(3,147,10,0.3)" : "rgba(211,47,47,0.3)"}`,
          }}
        />
      );
    },
  },
];
