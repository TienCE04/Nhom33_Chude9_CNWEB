import { useEffect, useCallback } from "react";
import { authApi } from "@/lib/api";

export const useGoogleLogin = (onSuccess, onError) => {
  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: authApi.getGoogleClientId(),
        callback: async (response) => {
          try {
            const result = await authApi.googleLogin(response.credential);

            if (result.success) {
              localStorage.setItem("authToken", result.token);
              localStorage.setItem("user", JSON.stringify(result.user));
              localStorage.setItem("isLoggedIn", "true");

              if (onSuccess) {
                onSuccess(result);
              }
            } else {
              if (onError) {
                onError(result.message || "Đăng nhập Google thất bại");
              }
            }
          } catch (error) {
            if (onError) {
              onError(error.message || "Lỗi kết nối");
            }
          }
        },
      });
    }
  }, [onSuccess, onError]);

  const renderButton = useCallback((elementId) => {
    if (window.google) {
      window.google.accounts.id.renderButton(
        document.getElementById(elementId),
        {
          theme: "outline",
          size: "large",
          width: "100%",
        }
      );
    }
  }, []);

  const showPrompt = useCallback(() => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  }, []);

  return { renderButton, showPrompt };
};

export default useGoogleLogin;
