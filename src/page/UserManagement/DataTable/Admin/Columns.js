import React from "react";
import { TextField, Typography } from "@mui/material";

export const columns = [
  {
    accessorKey: "fullName",
    header: "Full Name",
    muiEditTextFieldProps: { required: true },
  },
  {
    accessorKey: "email",
    header: "Email",
    muiEditTextFieldProps: { required: true, type: "email" },
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
    muiEditTextFieldProps: { required: true },
  },
  {
    accessorKey: "role",
    header: "Role",
    enableEditing: false,
  },
  {
    accessorKey: "password",
    header: "Password",
    enableSorting: false,
    Cell: () => "••••••••",
    // Password can only be set when the account is created — editing an
    // existing admin must never be able to overwrite it (there's no
    // hashing hook on update, only on create), so the edit dialog shows a
    // note instead of a field, and nothing is ever sent for this column
    // when editing.
    Edit: ({ cell, column, row }) => {
      const isNewRow = !row.original?.userId;
      if (!isNewRow) {
        return (
          <Typography variant="caption" color="text.secondary">
            Password can only be set when creating the account.
          </Typography>
        );
      }
      return (
        <TextField
          label="Password"
          type="password"
          required
          fullWidth
          defaultValue={cell.getValue() || ""}
          onChange={(e) => {
            row._valuesCache[column.id] = e.target.value;
          }}
        />
      );
    },
  },
];
