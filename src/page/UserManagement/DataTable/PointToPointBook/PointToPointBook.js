import React from "react";
import MDataTable from "../MDataTable";
import useDeleteData from "../../../../store/hooks/useDeleteData";
import useGetData from "../../../../store/hooks/useGetData";
import usePostData from "../../../../store/hooks/usePostData";
import usePutData from "../../../../store/hooks/usePutData";
import { columns } from "./columns";

function PointToPointBooks() {
  const [pointToPointBookId, setPointToPointBookId] = React.useState(null);

  let endpoint = `/api/v1/point-to-point-books`;
  let getEndpoint = `/api/v1/point-to-point-books`;
  let deleteEndpoint = `/api/v1/point-to-point-books`;
  let editEndpoint = `/api/v1/point-to-point-books`;

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
  } = usePutData(editEndpoint, pointToPointBookId, data);

  const handleEdit = async ({ row, values, table }) => {
    update({
      endpoint: editEndpoint,
      Id: row.original.pointToPointBookId,
      data: values,
    });
    table.setEditingRow(null);
  };

  const { mutateAsync: deleteData, isPending: isDeleting } = useDeleteData(
    deleteEndpoint,
    pointToPointBookId
  );

  const openDeleteConfirmModal = (row) => {
    if (
      window.confirm(
        "Are you sure you want to delete this Point to Point Book?"
      )
    ) {
      deleteData({
        endpoint: deleteEndpoint,
        Id: row.original.pointToPointBookId,
      });
    }
  };

  return (
    <div>
      <MDataTable
        headerTitle="Point to Point Books"
        add="Point to Point Book"
        openDeleteConfirmModal={openDeleteConfirmModal}
        handleNewAdd={handleNewAdd}
        handleEdit={handleEdit}
        editable={true}
        columns={columns}
        data={response || []}
        isLoading={isLoadingGet}
        isError={isErrorGet}
        title={"Point to Point Book"}
      />
    </div>
  );
}
export default PointToPointBooks;
