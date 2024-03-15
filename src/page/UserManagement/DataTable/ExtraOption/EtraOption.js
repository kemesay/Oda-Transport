import React from "react";
import MDataTable from "../MDataTable";
import useDeleteData from "../../../../store/hooks/useDeleteData";
import useGetData from "../../../../store/hooks/useGetData";
import usePostData from "../../../../store/hooks/usePostData";
import usePutData from "../../../../store/hooks/usePutData";
import { columns } from "./columns";

function EtraOptions() {
  const [extraOptionId, setExtraOptionId] = React.useState(null);

  let endpoint = `/api/v1/extra-options`;
  let getEndpoint = `/api/v1/extra-options`;
  let deleteEndpoint = `/api/v1/extra-options`;
  let editEndpoint = `/api/v1/extra-options`;

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
  } = usePutData(editEndpoint,extraOptionId, data);

  const handleEdit = async ({ row, values, table }) => {
    update({
      endpoint: editEndpoint,
      Id: row.original.extraOptionId,
      data: values,
    });
    table.setEditingRow(null);
  };

  const { mutateAsync: deleteData, isPending: isDeleting } = useDeleteData(deleteEndpoint, extraOptionId);

  const openDeleteConfirmModal = (row) => {
    if (window.confirm("Are you sure you want to delete this Etra_option?")) {
      deleteData({ endpoint: deleteEndpoint, Id: row.original.extraOptionId });
    }
  };

  return (
    <div>
      <MDataTable
        headerTitle="Extra Options"
        add="Extra Option"
        openDeleteConfirmModal={openDeleteConfirmModal}
        handleNewAdd={handleNewAdd}
        handleEdit={handleEdit}
        editable={true}
        columns={columns}
        data={response || []}
        isLoading={isLoadingGet}
        isError={isErrorGet}
        title={"Extra Option"}
      />
    </div>
  );
}
export default EtraOptions;
