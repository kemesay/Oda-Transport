import React from "react";
import MDataTable from "../MDataTable";
import useGetData from "../../../../store/hooks/useGetData";
import { BACKEND_API } from "../../../../store/utils/API";
import { columns } from "./columns";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function PromoCode() {
  const navigate = useNavigate();
  const endpoint = `/api/v1/promo-codes?pageSize=200`;

  const {
    data: response,
    isLoading: isLoadingGet,
    isError: isErrorGet,
    refetch,
  } = useGetData(endpoint);

  // Only "isActive" is ever editable here (see columns.js) — every other
  // field is set once at creation and never changed, so the edit dialog
  // only ever needs to hit the existing activate/deactivate endpoint.
  const handleEdit = async ({ row, values, table }) => {
    try {
      await BACKEND_API.patch(
        `/api/v1/promo-codes/${row.original.code}/active`,
        { isActive: values.isActive === true || values.isActive === "true" }
      );
      toast.success(
        `${row.original.code} is now ${values.isActive ? "active" : "inactive"}.`
      );
      refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status.");
    }
    table.setEditingRow(null);
  };

  // "View" in the row menu doubles as "Edit" here — it opens the full edit
  // page (discount, limits, dates, active state) for the selected code,
  // including one that's currently inactive.
  const handleViewClick = (rowData) => {
    navigate("/dashboard/edit-promo-code", { state: { rowData } });
  };

  return (
    <div>
      <MDataTable
        headerTitle="Promo Codes"
        add="Promo Code"
        handleEdit={handleEdit}
        handleViewClick={handleViewClick}
        editable={true}
        columns={columns}
        data={response?.data || []}
        isLoading={isLoadingGet}
        isError={isErrorGet}
        title={"Promo Code"}
      />
      <ToastContainer />
    </div>
  );
}
export default PromoCode;
