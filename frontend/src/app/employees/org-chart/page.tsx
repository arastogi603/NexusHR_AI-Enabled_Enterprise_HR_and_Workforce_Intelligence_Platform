"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Building2,
  ChevronDown,
  ChevronUp,
  Mail,
  Briefcase,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  FolderTree
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface OrgNode {
  id: string;
  employeeCode?: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  avatar?: string;
  managerId?: string;
  children: OrgNode[];
}

export default function OrgChartPage() {
  const [roots, setRoots] = useState<OrgNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const fetchOrgChart = async () => {
    try {
      setLoading(true);
      const res = await api.get("/employees/org-chart");
      setRoots(res.data || []);
    } catch (err: any) {
      console.warn("Failed to fetch org chart from backend, falling back to directory assembly", err);
      // Fallback: assemble from /employees
      try {
        const empRes = await api.get("/employees?size=100");
        const list = empRes.data.content || [];
        const assembled = buildTreeFromList(list);
        setRoots(assembled);
      } catch (e) {
        toast.error("Could not load organizational structure");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgChart();
  }, []);

  const buildTreeFromList = (list: any[]): OrgNode[] => {
    const nodeMap: Record<string, OrgNode> = {};
    list.forEach((emp) => {
      const initial = `${emp.firstName?.[0] || ""}${emp.lastName?.[0] || ""}`.toUpperCase();
      nodeMap[emp.id] = {
        id: emp.id,
        employeeCode: emp.employeeCode || "NX-" + emp.id.substring(0, 4).toUpperCase(),
        name: `${emp.firstName} ${emp.lastName}`,
        designation: emp.designation || "Specialist",
        department: emp.departmentName || "Engineering",
        email: emp.email,
        avatar: initial,
        managerId: emp.managerId,
        children: [],
      };
    });

    const rootList: OrgNode[] = [];
    Object.values(nodeMap).forEach((node) => {
      if (!node.managerId || !nodeMap[node.managerId] || node.managerId === node.id) {
        rootList.push(node);
      } else {
        nodeMap[node.managerId].children.push(node);
      }
    });

    return rootList.length > 0 ? rootList : Object.values(nodeMap);
  };

  const departments = useMemo(() => {
    const set = new Set<string>();
    const traverse = (node: OrgNode) => {
      if (node.department) set.add(node.department);
      node.children?.forEach(traverse);
    };
    roots.forEach(traverse);
    return Array.from(set);
  }, [roots]);

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => setCollapsedNodes({});
  const collapseAll = () => {
    const newCollapsed: Record<string, boolean> = {};
    const traverse = (node: OrgNode) => {
      if (node.children?.length > 0) newCollapsed[node.id] = true;
      node.children?.forEach(traverse);
    };
    roots.forEach(traverse);
    setCollapsedNodes(newCollapsed);
  };

  const renderNode = (node: OrgNode, depth: number = 0) => {
    const isCollapsed = !!collapsedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const isMatched = searchQuery
      ? node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.department.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const isDeptMatched = selectedDept === "ALL" || node.department === selectedDept;

    return (
      <div key={node.id} className="flex flex-col items-center relative my-4">
        {/* Card */}
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          onClick={() => setSelectedNode(node)}
          className={`cursor-pointer w-64 p-4 rounded-2xl backdrop-blur-xl border transition-all relative z-10 ${
            selectedNode?.id === node.id
              ? "bg-indigo-950/80 border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.4)] ring-2 ring-indigo-400"
              : isMatched && isDeptMatched
              ? "bg-slate-900/85 border-slate-700/60 hover:border-slate-500 shadow-xl hover:shadow-2xl"
              : "bg-slate-900/40 border-slate-800/40 opacity-40 hover:opacity-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-sm flex items-center justify-center shadow-md shrink-0">
              {node.avatar || node.name.substring(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm text-slate-100 truncate">{node.name}</div>
              <div className="text-xs text-indigo-400 truncate font-medium">{node.designation}</div>
              <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                <span>{node.department}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-mono text-[10px] text-slate-500">{node.employeeCode || "ID"}</span>
            {hasChildren && (
              <button
                onClick={(e) => toggleCollapse(node.id, e)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-indigo-300 transition-colors text-[10px] font-medium"
              >
                <span>{node.children.length} report{node.children.length > 1 ? "s" : ""}</span>
                {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
            )}
          </div>
        </motion.div>

        {/* Tree connectors and children */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col items-center">
            {/* Vertical connector down from parent */}
            <div className="w-0.5 h-6 bg-indigo-500/40" />

            {/* Horizontal branch bar if multiple children */}
            {node.children.length > 1 && (
              <div
                className="h-0.5 bg-indigo-500/40"
                style={{
                  width: `calc(100% - ${280 / node.children.length}px)`,
                  minWidth: "200px",
                }}
              />
            )}

            {/* Children container */}
            <div className="flex items-start justify-center gap-6 pt-2">
              {node.children.map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="w-0.5 h-4 bg-indigo-500/40" />
                  {renderNode(child, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Banner & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/employees"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <FolderTree className="w-6 h-6" />
            </div>
            Organizational Tree Hierarchy
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Dynamic, multi-tiered reporting tree visualization mapping enterprise leadership, managers, and teams.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchOrgChart}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50 transition-colors"
            title="Refresh tree"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="flex items-center rounded-xl bg-slate-800/80 border border-slate-700/50 p-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 text-slate-300 font-mono font-medium">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={expandAll}
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-300 border border-slate-700/50"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-300 border border-slate-700/50"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by name, designation, or role..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/60 border border-slate-700/60 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-medium shrink-0">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-700/60 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive Tree View Canvas */}
      <div className="relative rounded-3xl bg-slate-950/80 border border-slate-800/80 p-8 min-h-[550px] overflow-auto flex justify-center items-start shadow-inner">
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400">Rendering hierarchical tree matrix...</p>
          </div>
        ) : roots.length === 0 ? (
          <div className="py-24 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-300">No organizational records found</p>
            <p className="text-xs text-slate-500 mt-1">Please populate employees in the directory first.</p>
          </div>
        ) : (
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "top center",
              transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            className="flex flex-wrap items-start justify-center gap-12"
          >
            {roots.map((root) => renderNode(root))}
          </div>
        )}
      </div>

      {/* Selected Employee Quick Detail Drawer */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-6 bottom-6 w-96 p-5 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/40 shadow-2xl z-40 text-slate-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-base flex items-center justify-center shadow-md">
                  {selectedNode.avatar || selectedNode.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedNode.name}</h3>
                  <p className="text-xs text-indigo-400 font-medium">{selectedNode.designation}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2 text-xs divide-y divide-slate-800">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-slate-200">{selectedNode.department}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Employee Code:</span>
                <span className="font-mono text-slate-300">{selectedNode.employeeCode}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-300">{selectedNode.email}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Direct Reports:</span>
                <span className="font-bold text-indigo-300">
                  {selectedNode.children?.length || 0} team members
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Link
                href={`/employees`}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold text-center transition-colors shadow-sm"
              >
                View in Directory
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
