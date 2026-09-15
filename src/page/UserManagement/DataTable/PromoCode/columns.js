import React from "react";
import { Chip } from "@mui/material";

const formatDiscount = (row) =>
  row.discountType === "flat"
    ? `$${Number(row.discountValue).toFixed(2)} off`
    : `${Number(row.discountValue)}% off`;

export const columns = [
  {
    accessorKey: "code",
    header: "Code",
    enableEditing: false,
    Cell: ({ cell }) => (
      <strong style={{ letterSpacing: "0.5px" }}>{cell.getValue()}</strong>
    ),
  },
  {
    accessorKey: "discountValue",
    header: "Discount",
    enableEditing: false,
    Cell: ({ row }) => formatDiscount(row.original),
  },
  {
    accessorKey: "minFareAmount",
    header: "Min Fare",
    enableEditing: false,
    Cell: ({ cell }) =>
      cell.getValue() != null ? `$${Number(cell.getValue()).toFixed(2)}` : "Any",
  },
  {
    accessorKey: "maxRedemptionsPerUser",
    header: "Uses / User",
    enableEditing: false,
  },
  {
    accessorKey: "maxTotalRedemptions",
    header: "Total Use Limit",
    enableEditing: false,
    Cell: ({ cell }) => cell.getValue() ?? "Unlimited",
  },
  {
    accessorKey: "maxRedemptionsPerPeriod",
    header: "Period Cap",
    enableEditing: false,
    Cell: ({ row }) =>
      row.original.periodDays && row.original.maxRedemptionsPerPeriod
        ? `${row.original.maxRedemptionsPerPeriod} / ${row.original.periodDays} days`
        : "—",
  },
  {
    accessorKey: "expiresAt",
    header: "Expires",
    enableEditing: false,
    Cell: ({ cell }) =>
      cell.getValue() ? new Date(cell.getValue()).toLocaleDateString() : "Never",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    editVariant: "select",
    editSelectOptions: [
      { value: true, text: "Active" },
      { value: false, text: "Inactive" },
    ],
    Cell: ({ cell }) => (
      <Chip
        size="small"
        label={cell.getValue() ? "Active" : "Inactive"}
        sx={{
          bgcolor: cell.getValue() ? "#e3f3e2" : "#f3e2e2",
          color: cell.getValue() ? "#026e08" : "#a02323",
          fontWeight: 600,
        }}
      />
    ),
  },
];
