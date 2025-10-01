
export default function ProfilePage() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-2xl font-bold tracking-tight">
          My Profile
        </h3>
        <p className="text-sm text-muted-foreground">
          Manage your profile settings here.
        </p>
      </div>
    </div>
  );
}
