import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthUser, UserRole } from '../types/auth';
import {
  generateMockJwt,
  decodeJwt,
  saveToken,
  getStoredToken,
  removeStoredToken,
} from '../utils/jwt';

export interface SystemUser extends AuthUser {
  passwordHash: string;
}

const INITIAL_MOCK_USERS: SystemUser[] = [
  { id: 'u_101', email: 'admin@gmail.com', name: 'Professor Admin', role: 'admin', passwordHash: 'password123' },
  { id: 'u_102', email: 'editor@gmail.com', name: 'Student Editor', role: 'editor', passwordHash: 'password123' },
  { id: 'u_103', email: 'viewer@gmail.com', name: 'Guest Viewer', role: 'viewer', passwordHash: 'password123' },
];

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  usersList: SystemUser[];
}

const initialToken = getStoredToken();
const initialPayload = initialToken ? decodeJwt(initialToken) : null;

const initialState: AuthState = {
  user: initialPayload ? { id: initialPayload.id, email: initialPayload.email, name: initialPayload.name, role: initialPayload.role } : null,
  token: initialPayload ? initialToken : null,
  isAuthenticated: Boolean(initialPayload),
  loading: false,
  error: null,
  usersList: INITIAL_MOCK_USERS,
};

// Login Async Thunk
export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { getState, rejectWithValue }) => {
    await new Promise((res) => setTimeout(res, 400));

    const state = getState() as { auth: AuthState };
    const users = state.auth.usersList.length > 0 ? state.auth.usersList : INITIAL_MOCK_USERS;

    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.passwordHash === password
    );

    if (!foundUser) {
      return rejectWithValue('Invalid credentials. Try admin@gmail.com, editor@gmail.com, or viewer@gmail.com (password123)');
    }

    const authUser: AuthUser = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
    };

    const token = generateMockJwt(authUser);
    saveToken(token);

    return { user: authUser, token };
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutAction: (state) => {
      removeStoredToken();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    updateUserRole: (state, action: PayloadAction<{ userId: string; newRole: UserRole }>) => {
      const { userId, newRole } = action.payload;
      const targetUser = state.usersList.find((u) => u.id === userId);
      if (targetUser) {
        targetUser.role = newRole;
        if (state.user && state.user.id === userId) {
          state.user.role = newRole;
          const newToken = generateMockJwt(state.user);
          saveToken(newToken);
          state.token = newToken;
        }
      }
    },
    addUser: (state, action: PayloadAction<{ name: string; email: string; role: UserRole; password?: string }>) => {
      const newUser: SystemUser = {
        id: `u_${Date.now()}`,
        name: action.payload.name,
        email: action.payload.email,
        role: action.payload.role,
        passwordHash: action.payload.password || 'password123',
      };
      state.usersList.push(newUser);
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state.usersList = state.usersList.filter((u) => u.id !== userId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logoutAction, clearAuthError, updateUserRole, addUser, deleteUser } = authSlice.actions;
export default authSlice.reducer;
