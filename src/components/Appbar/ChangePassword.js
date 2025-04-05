import React, { useState } from "react";
import {
  Dialog,
  Alert,
  Button,
  DialogContentText,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  IconButton,
  styled
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import RSTextField from "../RSTextField";
import axios from "axios";
import { remote_host } from "../../globalVariable";

// Styled components for enhanced visual appeal
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    padding: theme.spacing(2),
    maxWidth: '450px',
    width: '100%'
  }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#161F36',
  color: '#ffffff',
  padding: theme.spacing(2),
  position: 'relative',
  borderRadius: '8px 8px 0 0',
  fontSize: '1.25rem',
  fontWeight: 600
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '6px',
  padding: '8px 24px',
  textTransform: 'none',
  fontWeight: 600,
  '&.MuiButton-containedPrimary': {
    backgroundColor: '#03930A',
    '&:hover': {
      backgroundColor: '#027B08'
    }
  }
}));

export default function ChangePasswordDrawer({
  openChangePasswordPopup,
  setOpenChangePasswordPopup,
}) {
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confNewPassword: "",
  });
  const [changePending, setChangePending] = useState(false);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState({
    ischangePasswordSuccess: false,
    changePasswordSuccessMessage: "",
  });
  const [changePasswordFail, setChangePasswordFail] = useState({
    isChangePasswordFail: false,
    changePasswordFailMessage: "",
  });

  const handleClose = () => {
    setOpenChangePasswordPopup(false);
    // Reset form and states
    setChangePasswordData({
      currentPassword: "",
      newPassword: "",
      confNewPassword: "",
    });
    setChangePasswordSuccess({
      ischangePasswordSuccess: false,
      changePasswordSuccessMessage: "",
    });
    setChangePasswordFail({
      isChangePasswordFail: false,
      changePasswordFailMessage: "",
    });
  };

  const handleChangePassword = (e) => {
    const { name, value } = e.target;
    setChangePasswordData((prev) => ({ ...prev, [name]: value }));
    // Clear error messages when user starts typing
    setChangePasswordFail({
      isChangePasswordFail: false,
      changePasswordFailMessage: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setChangePending(true);
    const { currentPassword, newPassword, confNewPassword } = changePasswordData;

    // Validation
    if (!currentPassword || !newPassword || !confNewPassword) {
      setChangePasswordFail({
        isChangePasswordFail: true,
        changePasswordFailMessage: "Please fill all fields!",
      });
      setChangePending(false);
      return;
    }

    if (newPassword !== confNewPassword) {
      setChangePasswordFail({
        isChangePasswordFail: true,
        changePasswordFailMessage: "New passwords do not match!",
      });
      setChangePending(false);
      return;
    }

    try {
      const response = await axios.post(
        `${remote_host}/api/v1/auth/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
          },
        }
      );

      if (response?.status === 200) {
        setChangePasswordSuccess({
          changePasswordSuccessMessage: "Password successfully changed!",
          ischangePasswordSuccess: true,
        });
        // Close dialog after successful password change
        setTimeout(handleClose, 2000);
      }
    } catch (error) {
      setChangePasswordSuccess({
        ischangePasswordSuccess: false,
        changePasswordSuccessMessage: "",
      });
      setChangePasswordFail({
        isChangePasswordFail: true,
        changePasswordFailMessage: error.response?.data?.message || "Network Error!",
      });
    } finally {
      setChangePending(false);
    }
  };

  return (
    <StyledDialog
      open={openChangePasswordPopup}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <StyledDialogTitle>
        Change Password
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2, mt: 1 }}>
          {changePasswordSuccess.ischangePasswordSuccess && (
            <Alert 
              severity="success"
              sx={{ mb: 2 }}
            >
              {changePasswordSuccess.changePasswordSuccessMessage}
            </Alert>
          )}
          {changePasswordFail.isChangePasswordFail && (
            <Alert 
              severity="error"
              sx={{ mb: 2 }}
            >
              {changePasswordFail.changePasswordFailMessage}
            </Alert>
          )}
        </Box>

        <RSTextField
          autoFocus
          required
          margin="dense"
          name="currentPassword"
          label="Current Password"
          type="password"
          fullWidth
          variant="outlined"
          value={changePasswordData.currentPassword}
          onChange={handleChangePassword}
          sx={{ mb: 2 }}
        />
        <RSTextField
          required
          margin="dense"
          name="newPassword"
          label="New Password"
          type="password"
          fullWidth
          variant="outlined"
          value={changePasswordData.newPassword}
          onChange={handleChangePassword}
          sx={{ mb: 2 }}
        />
        <RSTextField
          required
          margin="dense"
          name="confNewPassword"
          label="Confirm New Password"
          type="password"
          fullWidth
          variant="outlined"
          value={changePasswordData.confNewPassword}
          onChange={handleChangePassword}
        />
      </DialogContent>

      <DialogActions sx={{ padding: 3, justifyContent: 'center' }}>
        <StyledButton
          onClick={handleClose}
          variant="outlined"
          color="primary"
        >
          Cancel
        </StyledButton>
        <StyledButton
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={changePending}
        >
          {changePending ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Change Password"
          )}
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
}
