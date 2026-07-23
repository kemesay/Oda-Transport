import React from "react";
import MDataTable from "../MDataTable";
import useDeleteData from "../../../../store/hooks/useDeleteData";
import useGetData from "../../../../store/hooks/useGetData";
import usePostData from "../../../../store/hooks/usePostData";
import usePutData from "../../../../store/hooks/usePutData";
import { useNavigate } from "react-router-dom";
import { columns } from "./columns";
import { ToastContainer } from "react-toastify";

function Drivers() {
  const [userId, setUserId] = React.useState(null);
  const postendpoint = `/api/v1/users/driver`;
  const getendpoint  = `/api/v1/users?role=driver`;
  const putendpoint  = `/api/v1/users`;
  const deleteendpoint = `/api/v1/users`;

  const {
    data: response,
    isLoading: isLoadingGet,
    isError: isErrorGet,
  } = useGetData(getendpoint);

  const navigate = useNavigate();

  const { mutate, data } = usePostData(postendpoint);
  const handleNewAdd = async ({ values, table }) => {
    mutate(values);
    table.setCreatingRow(null);
  };

  const { mutate: update } = usePutData(putendpoint, userId, data);
  const handleEdit = async ({ row, values, table }) => {
    update({
      endpoint: putendpoint,
      Id: row.original.userId,
      data: values,
    });
    table.setEditingRow(null);
  };

  const handleViewClick = (rowData) => {
    navigate("/dashboard/driver/driver-detail", { state: { rowData } });
  };

  const { mutateAsync: deleteData } = useDeleteData(deleteendpoint, userId);
  const openDeleteConfirmModal = (row) => {
    if (window.confirm("Are you sure you want to delete this Driver?")) {
      deleteData({ endpoint: deleteendpoint, Id: row.original.userId });
    }
  };

  return (
    <div>
      <MDataTable
        headerTitle="Drivers"
        add="Driver"
        openDeleteConfirmModal={openDeleteConfirmModal}
        handleNewAdd={handleNewAdd}
        handleEdit={handleEdit}
        editable={true}
        columns={columns}
        data={response || []}
        isLoading={isLoadingGet}
        isError={isErrorGet}
        title={"Driver"}
        handleViewClick={handleViewClick}
      />
      <ToastContainer />
    </div>
  );
}

export default Drivers;
