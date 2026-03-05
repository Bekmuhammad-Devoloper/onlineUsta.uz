interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-blue-100 text-blue-800",
  CONTRACT_SENT: "bg-purple-100 text-purple-800",
  PAYMENT_PENDING: "bg-orange-100 text-orange-800",
  PAYMENT_DONE: "bg-teal-100 text-teal-800",
  IN_PROGRESS: "bg-indigo-100 text-indigo-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  ACTIVE: "bg-green-100 text-green-800",
  BLOCKED: "bg-red-100 text-red-800",
  OPEN: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  PENDING: "Kutilmoqda",
  ACCEPTED: "Qabul qilindi",
  CONTRACT_SENT: "Shartnoma yuborildi",
  PAYMENT_PENDING: "To'lov kutilmoqda",
  PAYMENT_DONE: "To'lov qilindi",
  IN_PROGRESS: "Jarayonda",
  COMPLETED: "Tugallangan",
  CANCELLED: "Bekor qilingan",
  ACTIVE: "Faol",
  BLOCKED: "Bloklangan",
  OPEN: "Ochiq",
  RESOLVED: "Hal qilindi",
  APPROVED: "Tasdiqlangan",
  REJECTED: "Rad etilgan",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusColors[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {statusLabels[status] || status}
    </span>
  );
}
