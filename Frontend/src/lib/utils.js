import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getUserInfo = () => {
  try {
    const userInfo = localStorage.getItem("user");
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (err) {
    console.error("Invalid userInfo in localStorage");
    return null;
  }
};
