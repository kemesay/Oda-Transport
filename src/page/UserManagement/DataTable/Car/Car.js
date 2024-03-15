import React from "react";
import MDataTable from "../MDataTable";
import useDeleteData from "../../../../store/hooks/useDeleteData";
import useGetData from "../../../../store/hooks/useGetData";
import usePostData from "../../../../store/hooks/usePostData";
import usePutData from "../../../../store/hooks/usePutData";
import { columns } from "./columns";

function Cars() {
  const [carId, setCarId] = React.useState(null);

  let endpoint = `/api/v1/cars`;
  let getEndpoint = `/api/v1/cars`;
  let deleteEndpoint = `/api/v1/cars`;
  let editEndpoint = `/api/v1/cars`;

  const {
    data: response,
    isLoading: isLoadingGet,
    isError: isErrorGet,
    isFetching: isFetchingTax,
    error: errorGet,
  } = useGetData(getEndpoint);

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
  } = usePutData(editEndpoint,carId, data);

  const handleEdit = async ({ row, values, table }) => {
    update({
      endpoint: editEndpoint,
      Id: row.original.carId,
      data: values,
    });
    table.setEditingRow(null);
  };

  const { mutateAsync: deleteData, isPending: isDeleting } = useDeleteData(deleteEndpoint, carId);

  const openDeleteConfirmModal = (row) => {
    if (window.confirm("Are you sure you want to delete this Car?")) {
      deleteData({ endpoint: deleteEndpoint, Id: row.original.carId });
    }
  };

  return (
    <div>
      <MDataTable
        headerTitle="Cars"
        add="Car"
        openDeleteConfirmModal={openDeleteConfirmModal}
        handleNewAdd={handleNewAdd}
        handleEdit={handleEdit}
        editable={true}
        columns={columns}
        data={response || []}
        isLoading={isLoadingGet}
        isError={isErrorGet}
        title={"Car"}
      />
    </div>
  );
}
export default Cars;
