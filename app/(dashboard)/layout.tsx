const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-[#030a05]">
            {children}
        </div>
    );
};

export default DashboardLayout;
