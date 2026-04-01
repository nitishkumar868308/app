const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex items-center justify-center w-full bg-gray-100">
            {children}
        </div>
    );
};

export default AuthLayout;