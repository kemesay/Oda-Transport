import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import {
  ChevronRight as ChevronRightIcon,
  DeleteOutline as DeleteOutlineIcon,
  LockOutlined as LockOutlinedIcon,
  Person as PersonIcon,
  WarningAmber as WarningAmberIcon,
  ErrorOutline as ErrorOutlineIcon,
} from "@mui/icons-material";
import { BACKEND_API } from "../../store/utils/API";
import { logout } from "../../store/reducers/authReducer";

function UserSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordAlert, setPasswordAlert] = useState(null);

  const [deleteStep1Open, setDeleteStep1Open] = useState(false);
  const [deleteStep2Open, setDeleteStep2Open] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const deleteBullets = useMemo(
    () => [
      "Your profile information",
      "Booking history",
      "Payment methods",
      "All account data",
    ],
    []
  );

  useEffect(() => {
    if (!deleteSuccess) return undefined;
    const id = setTimeout(() => {
      navigate("/", { replace: true });
    }, 2200);
    return () => clearTimeout(id);
  }, [deleteSuccess, navigate]);

  const clearClientSession = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("session_expiration");
    sessionStorage.removeItem("user_info_cache");
    sessionStorage.removeItem("user_info_cache_time");
  };

  const resetDeleteFlow = () => {
    setDeleteLoading(false);
    setDeleteError("");
    setDeleteStep1Open(false);
    setDeleteStep2Open(false);
  };

  const openDeleteFlow = () => {
    setDeleteError("");
    setDeleteStep1Open(true);
  };

  const closeDeleteDialogs = () => {
    if (deleteLoading) return;
    resetDeleteFlow();
  };

  const continueToFinalDelete = () => {
    setDeleteError("");
    setDeleteStep1Open(false);
    setDeleteStep2Open(true);
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setDeleteLoading(true);
    try {
      await BACKEND_API.delete("/api/v1/users/me");
      clearClientSession();
      dispatch(logout());
      setDeleteStep2Open(false);
      setDeleteSuccess(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "We could not delete your account right now. Please try again or contact support.";
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordAlert({
        type: "error",
        message: "New passwords do not match",
      });
      return;
    }
    setPasswordAlert({
      type: "success",
      message: "Password updated successfully",
    });
    setOpenPasswordDialog(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  if (deleteSuccess) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 560, mx: "auto", mt: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Your account has been removed
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Thank you for riding with us. You will be redirected to the home page
            in a moment.
          </Typography>
          <CircularProgress size={28} sx={{ color: "primary.main" }} />
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Card sx={{ maxWidth: 760, mx: "auto", mt: 2, borderRadius: 3 }}>
        <CardContent sx={{ pb: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: "rgba(255, 112, 1, 0.12)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <PersonIcon sx={{ color: "#FF7001" }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              Account
            </Typography>
          </Box>
        </CardContent>

        <List sx={{ px: 0 }}>
          <ListItemButton onClick={() => setOpenPasswordDialog(true)} sx={{ py: 2 }}>
            <ListItemIcon sx={{ minWidth: 44 }}>
              <LockOutlinedIcon sx={{ color: "#2E7D32" }} />
            </ListItemIcon>
            <ListItemText
              primary="Change Password"
              primaryTypographyProps={{ fontWeight: 600 }}
            />
            <ChevronRightIcon sx={{ color: "text.secondary" }} />
          </ListItemButton>
          <Divider />
          <ListItemButton onClick={openDeleteFlow} sx={{ py: 2 }}>
            <ListItemIcon sx={{ minWidth: 44 }}>
              <DeleteOutlineIcon sx={{ color: "error.main" }} />
            </ListItemIcon>
            <ListItemText
              primary="Delete Account"
              primaryTypographyProps={{ fontWeight: 700, color: "error.main" }}
            />
            <ChevronRightIcon sx={{ color: "text.secondary" }} />
          </ListItemButton>
        </List>
      </Card>

      {/* Delete Step 1 */}
      <Dialog
        open={deleteStep1Open}
        onClose={closeDeleteDialogs}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <WarningAmberIcon sx={{ color: "error.main" }} />
            <Typography variant="h5" fontWeight={800}>
              Delete Account
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ fontWeight: 700, mb: 2 }}>
            Are you sure you want to permanently delete your account?
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            This action cannot be undone. All your data will be permanently deleted,
            including:
          </Typography>

          <Box component="ul" sx={{ pl: 3, my: 0, color: "text.primary" }}>
            {deleteBullets.map((b) => (
              <li key={b}>
                <Typography variant="body2" sx={{ lineHeight: 1.9 }}>
                  {b}
                </Typography>
              </li>
            ))}
          </Box>

          <Typography
            variant="body2"
            sx={{ mt: 2, color: "#C77700", fontWeight: 700 }}
          >
            If you have any active bookings, please cancel them before deleting your
            account.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button
            onClick={closeDeleteDialogs}
            disabled={deleteLoading}
            sx={{ color: "#2E7D32", fontWeight: 800 }}
          >
            Cancel
          </Button>
          <Button
            onClick={continueToFinalDelete}
            variant="contained"
            disabled={deleteLoading}
            sx={{
              bgcolor: "#E53935",
              px: 4,
              borderRadius: 999,
              fontWeight: 800,
              textTransform: "none",
              "&:hover": { bgcolor: "#D32F2F" },
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Step 2 */}
      <Dialog
        open={deleteStep2Open}
        onClose={closeDeleteDialogs}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogContent sx={{ pt: 3, textAlign: "center" }}>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDeleteError("")}>
              {deleteError}
            </Alert>
          )}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <ErrorOutlineIcon sx={{ color: "error.main", fontSize: 40 }} />
          </Box>
          <Typography variant="h4" fontWeight={900} sx={{ mb: 1 }}>
            Final Confirmation
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            This is your last chance to cancel.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Your account will be permanently deleted and cannot be recovered.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Are you absolutely sure?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1, justifyContent: "space-between" }}>
          <Button
            onClick={closeDeleteDialogs}
            disabled={deleteLoading}
            sx={{ color: "#2E7D32", fontWeight: 800 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            variant="contained"
            disabled={deleteLoading}
            startIcon={
              deleteLoading ? <CircularProgress size={18} color="inherit" /> : null
            }
            sx={{
              bgcolor: "#E53935",
              px: 4,
              borderRadius: 999,
              fontWeight: 900,
              textTransform: "none",
              "&:hover": { bgcolor: "#D32F2F" },
            }}
          >
            {deleteLoading ? "Deleting…" : "Delete Forever"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password (existing placeholder logic) */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
            Change Password
          </Typography>
          {passwordAlert && (
            <Alert severity={passwordAlert.type} sx={{ mb: 2 }}>
              {passwordAlert.message}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              type="password"
              label="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              fullWidth
            />
            <TextField
              type="password"
              label="New Password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              fullWidth
            />
            <TextField
              type="password"
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenPasswordDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            sx={{
              bgcolor: "#03930A",
              "&:hover": { bgcolor: "#03830A" },
              fontWeight: 800,
              textTransform: "none",
            }}
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserSettings;
