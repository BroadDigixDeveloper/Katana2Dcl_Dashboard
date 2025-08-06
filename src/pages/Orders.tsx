export const Orders = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground">Manage all your orders and their status.</p>
      </div>
      
      <div className="chart-container min-h-96 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Orders Management</h3>
          <p className="text-muted-foreground">Full orders interface will be connected to MongoDB backend.</p>
        </div>
      </div>
    </div>
  );
};