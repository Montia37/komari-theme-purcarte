interface NodeListHeaderProps {
  enableSwap: boolean | undefined;
}

export const NodeListHeader = ({ enableSwap }: NodeListHeaderProps) => {
  const gridCols = enableSwap ? "grid-cols-10" : "grid-cols-9";
  return (
    <div
      className={`text-primary font-bold grid ${gridCols} text-center shadow-md gap-4 p-2 items-center rounded-lg bg-card/50 transition-colors duration-200`}>
      <div className="col-span-2">节点名称</div>
      <div className="col-span-1">CPU</div>
      <div className="col-span-1">内存</div>
      {enableSwap && <div className="col-span-1">SWAP</div>}
      <div className="col-span-1">硬盘</div>
      <div className="col-span-1">网络</div>
      <div className="col-span-2">流量</div>
      <div className="col-span-1">负载</div>
    </div>
  );
};
