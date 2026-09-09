import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/services/api";
import { notificationApi } from "@/services/notificationApi";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { AppNotification } from "@/types";

type NavbarProps = {
  onOpenSidebar: () => void;
};

export function Navbar({ onOpenSidebar }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const bellRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    notificationApi
      .listNotifications({ per_page: 8 })
      .then((page) => {
        if (!active) return;
        setNotifications(page.data);
        setUnread(page.data.filter((n) => !n.is_read).length);
      })
      .catch(() => {
        // Ignore — badge is best-effort.
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setBellOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const notificationsPath = user.role === "student" ? "/student/notifications" : null;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnread(0);
    } catch (error) {
      console.error(getErrorMessage(error));
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-pointer rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
        >
          <Icon name="menu" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div ref={bellRef} className="relative">
          <button
            type="button"
            className="relative cursor-pointer rounded-md p-2 text-gray-600 hover:bg-gray-100"
            onClick={() => {
              setBellOpen((v) => !v);
              setUserOpen(false);
            }}
            aria-label="Notifications"
          >
            <Icon name="bell" className="size-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
                {unread > 0 && (
                  <Button variant="tertiary" size="sm" onClick={markAllRead}>
                    Mark all read
                  </Button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-gray-500">No notifications</p>
                )}
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "border-b border-gray-50 px-4 py-3",
                      !notification.is_read && "bg-emerald-50/50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <span className="shrink-0 text-xs text-gray-400">{timeAgo(notification.created_at)}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{notification.message}</p>
                  </div>
                ))}
              </div>
              {notificationsPath && (
                <div className="border-t border-gray-100 p-2">
                  <Link
                    to={notificationsPath}
                    className="block rounded-md px-3 py-1.5 text-center text-sm text-emerald-700 hover:bg-emerald-50"
                    onClick={() => setBellOpen(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div ref={userRef} className="relative">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 hover:bg-gray-100"
            onClick={() => {
              setUserOpen((v) => !v);
              setBellOpen(false);
            }}
            aria-label="Account menu"
          >
            <Avatar name={user.name} src={user.avatar} size="sm" />
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium text-gray-900">{user.name}</span>
              <span className="block text-xs capitalize text-gray-500">{user.role}</span>
            </span>
          </button>

          {userOpen && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg">
              <div className="border-b border-gray-100 px-4 py-2">
                <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="truncate text-xs text-gray-500">{user.email}</p>
              </div>
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setUserOpen(false)}
              >
                <Icon name="user" className="size-4" />
                My Profile
              </Link>
              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <Icon name="logout" className="size-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}