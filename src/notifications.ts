import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Task } from "./data";

/* ------------------------------------------------------------------
   Local notifications for time-sensitive maintenance tasks.

   Tasks flagged `timeSensitive` schedule a local reminder on their due
   date (09:00 local). The scheduled notification id is stored on the
   task so it can be cancelled or rescheduled when the task moves,
   completes, or is deleted.
------------------------------------------------------------------- */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let permissionAsked = false;

/* User preferences, mirrored from persisted app settings. */
let prefs = { enabled: true, hour: 9 };
export function setNotifPrefs(next: { enabled: boolean; hour: number }) {
  prefs = next;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("tasks", {
        name: "Task reminders",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (current.canAskAgain || !permissionAsked) {
      permissionAsked = true;
      const req = await Notifications.requestPermissionsAsync();
      return req.granted;
    }
    return false;
  } catch {
    return false;
  }
}

/** Reminder fires at the user's chosen hour (local) on the task's due date. */
function reminderDate(dateKey: string): Date | null {
  const hh = String(prefs.hour).padStart(2, "0");
  const d = new Date(`${dateKey}T${hh}:00:00`);
  if (isNaN(d.getTime())) return null;
  if (d.getTime() <= Date.now()) return null; // don't schedule in the past
  return d;
}

/**
 * Schedule (or skip) a reminder for a task. Returns the notification id,
 * or null if nothing was scheduled (not time-sensitive, past due, or no
 * permission).
 */
export async function scheduleTaskReminder(task: Task, tankName: string): Promise<string | null> {
  if (!prefs.enabled) return null;
  if (task.priority !== "timeSensitive") return null;
  const when = reminderDate(task.next);
  if (!when) return null;
  const granted = await ensureNotificationPermission();
  if (!granted) return null;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `🐟 ${tankName}`,
        body: `${task.title} is due today.`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
        channelId: Platform.OS === "android" ? "tasks" : undefined,
      },
    });
  } catch {
    return null;
  }
}

export async function cancelReminder(notifId?: string | null): Promise<void> {
  if (!notifId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notifId);
  } catch {
    /* already fired or cancelled — ignore */
  }
}

export async function cancelAllReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    /* ignore */
  }
}
