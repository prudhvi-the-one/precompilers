import { PASSWORD_RULES } from "@/lib/passwordPolicy";

function RuleIcon({ satisfied }: { satisfied: boolean }) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] leading-none ${
        satisfied ? "bg-green-600 text-white" : "bg-gray-200 text-transparent"
      }`}
    >
      ✓
    </span>
  );
}

export default function PasswordStrength({ password }: { password: string }) {
  const satisfiedCount = PASSWORD_RULES.filter((rule) =>
    rule.test(password)
  ).length;
  const strengthPercent = (satisfiedCount / PASSWORD_RULES.length) * 100;
  const strengthColor =
    satisfiedCount <= 2
      ? "bg-red-500"
      : satisfiedCount < PASSWORD_RULES.length
        ? "bg-yellow-500"
        : "bg-green-600";

  return (
    <div className="space-y-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all ${strengthColor}`}
          style={{ width: `${strengthPercent}%` }}
        />
      </div>
      <ul className="space-y-1">
        {PASSWORD_RULES.map((rule) => {
          const satisfied = rule.test(password);
          return (
            <li
              key={rule.key}
              className={`flex items-center gap-2 text-xs ${
                satisfied ? "text-green-700" : "text-gray-500"
              }`}
            >
              <RuleIcon satisfied={satisfied} />
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
