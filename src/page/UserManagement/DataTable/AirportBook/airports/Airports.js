import React, { useState } from "react";
import MDataTable from "../../MDataTable";
import useDeleteData from "../../../../../store/hooks/useDeleteData";
import useGetData from "../../../../../store/hooks/useGetData";
import usePostData from "../../../../../store/hooks/usePostData";
import usePutData from "../../../../../store/hooks/usePutData";
import { columns } from "./columns";
import { useNavigate } from "react-router-dom";

function Airports() {
  const [airportId, setAirportId] = React.useState(null);
 
  const navigate = useNavigate();

  let endpoint = `/api/v1/airports`;

  const {
    data: response,
    isLoading: isLoadingGet,
    isError: isErrorGet,
    isFetching: isFetchingTax,
    error: errorGet,
  } = useGetData(endpoint);

  const { mutate, isLoading, isError, data, isSuccess } = usePostData(endpoint);
  const handleNewAdd = async ({ values, table }) => {
    mutate(values);

    table.setCreatingRow(null);
  };

  const {
    mutate: update,
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    isSuccess: setSuccessUpdate,
    error: errorupdate,
  } = usePutData(endpoint, airportId, data);

  const handleEdit = async ({ row, values, table }) => {
    update({
      endpoint: endpoint,
      Id: row.original.airportId,
      data: values,
    });
    table.setEditingRow(null);
  };
  const handleViewClick = (rowData) => {
    navigate("/dashboard/airport/airport-detail", { state: { rowData } });
  };
  const { mutateAsync: deleteData, isPending: isDeleting } = useDeleteData(
    endpoint,
    airportId
  );
  const openDeleteConfirmModal = (row) => {
    if (window.confirm("Are you sure you want to delete this Air-port?")) {
      deleteData({ endpoint: endpoint, Id: row.original.airportId });
    }
  };

  return (
    <div>
      <MDataTable
        headerTitle="Airports"
        add="Air port"
        openDeleteConfirmModal={openDeleteConfirmModal}
        handleNewAdd={handleNewAdd}
        handleEdit={handleEdit}
        editable={true}
        columns={columns}
        data={response || []}
        isLoading={isLoadingGet}
        isError={isErrorGet}
        title={"Air ports"}
        handleViewClick={handleViewClick}

      />
    </div>
  );
}
export default Airports;
