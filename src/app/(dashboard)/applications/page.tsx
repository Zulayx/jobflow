"use client";

import { useState, useEffect, useCallback } from "react";
import { Application, ApplicationStatus } from "@/types";
import { FloatingJobCard, AnimatedBackground, StatusPill, ProgressTrack } from "@/components/FloatingJobCard";

const statusColors: Record<string, string> = {
  wishlist: "status-wishlist",
  applied: "status-applied",
  screening: "status-screening",
  interview: "status-interview",
  offer: "status-offer",
  rejected: "status-rejected",
  accepted: "status-accepted",
};

const statusOptions: ApplicationStatus[] = [
  "wishlist",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "accepted",
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [formData, setFormData] = useState({
    company: "",
    position: "",
    status: "applied" as ApplicationStatus,
    jobUrl: "",
    location: "",
    salary: "",
    notes: "",
    tags: "",
  });

  const fetchApplications = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);

      const response = await fetch(`/api/applications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingApp ? `/api/applications/${editingApp.id}` : "/api/applications";
      const method = editingApp ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchApplications();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error("Failed to save application:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      const response = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      if (response.ok) {
        await fetchApplications();
      }
    } catch (error) {
      console.error("Failed to delete application:", error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchApplications();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const openEditModal = (app: Application) => {
    setEditingApp(app);
    setFormData({
      company: app.company,
      position: app.position,
      status: app.status as ApplicationStatus,
      jobUrl: app.jobUrl || "",
      location: app.location || "",
      salary: app.salary || "",
      notes: app.notes || "",
      tags: app.tags || "",
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingApp(null);
    setFormData({
      company: "",
      position: "",
      status: "applied",
      jobUrl: "",
      location: "",
      salary: "",
      notes: "",
      tags: "",
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    interview: applications.filter((a) => a.status === "interview").length,
    offer: applications.filter((a) => a.status === "offer" || a.status === "accepted").length,
  };

  const filteredApplications = applications.filter((app) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        app.company.toLowerCase().includes(query) ||
        app.position.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div>
      <AnimatedBackground />
      <div className="relative z-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Applications</h1>
        <p className="text-text-secondary">Track and manage your job applications</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-stagger">
        <div className="glass-card p-6">
          <div className="text-3xl font-bold gradient-text">{stats.total}</div>
          <div className="text-sm text-text-secondary">Total</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-3xl font-bold text-accent-primary">{stats.applied}</div>
          <div className="text-sm text-text-secondary">Applied</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-3xl font-bold text-accent-tertiary">{stats.interview}</div>
          <div className="text-sm text-text-secondary">Interviews</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-3xl font-bold text-success">{stats.offer}</div>
          <div className="text-sm text-text-secondary">Offers</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-12"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field md:w-48"
        >
          <option value="all">All Status</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-3 rounded-lg transition-colors ${
              viewMode === "grid"
                ? "bg-accent-primary text-white"
                : "glass text-text-secondary hover:text-white"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-3 rounded-lg transition-colors ${
              viewMode === "list"
                ? "bg-accent-primary text-white"
                : "glass text-text-secondary hover:text-white"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Application
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-6 h-48 shimmer" />
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent-primary/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
          <p className="text-text-secondary mb-6">Start tracking your job search by adding your first application.</p>
          <button onClick={openAddModal} className="btn-primary">
            Add Your First Application
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="space-y-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {(Object.keys(statusColors) as ApplicationStatus[]).map((status) => (
              <StatusPill
                key={status}
                status={status}
                count={filteredApplications.filter((a) => a.status === status).length}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-stagger relative z-10">
            {filteredApplications.map((app, index) => (
              <FloatingJobCard
                key={app.id}
                application={app}
                onEdit={openEditModal}
                onDelete={handleDelete}
                isFeatured={index === 0 && statusFilter === "all"}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card overflow-hidden animate-stagger">
          <table className="w-full">
            <thead>
              <tr className="border-b border-glass-border">
                <th className="text-left p-4 text-sm font-semibold text-text-secondary">Company</th>
                <th className="text-left p-4 text-sm font-semibold text-text-secondary">Position</th>
                <th className="text-left p-4 text-sm font-semibold text-text-secondary">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-text-secondary">Location</th>
                <th className="text-left p-4 text-sm font-semibold text-text-secondary">Date</th>
                <th className="text-right p-4 text-sm font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr
                  key={app.id}
                  className="border-b border-glass-border hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => openEditModal(app)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent-gradient flex items-center justify-center text-white font-bold">
                        {app.company[0].toUpperCase()}
                      </div>
                      <span className="font-medium">{app.company}</span>
                    </div>
                  </td>
                  <td className="p-4 text-text-secondary">{app.position}</td>
                  <td className="p-4">
                    <span className={`status-badge ${statusColors[app.status]}`}>{app.status}</span>
                  </td>
                  <td className="p-4 text-text-secondary">{app.location || "-"}</td>
                  <td className="p-4 text-text-secondary">{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(app);
                        }}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(app.id);
                        }}
                        className="p-2 rounded-lg hover:bg-error/20 text-error transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative glass-card p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{editingApp ? "Edit Application" : "Add Application"}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Company *</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="input-field"
                  placeholder="Company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Position *</label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="input-field"
                  placeholder="Job title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                  className="input-field"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Job URL</label>
                <input
                  type="url"
                  value={formData.jobUrl}
                  onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                    placeholder="City or Remote"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Salary Range</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="input-field"
                    placeholder="$80k - $100k"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="input-field"
                  placeholder="React, TypeScript, Remote"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                  {isLoading ? "Saving..." : editingApp ? "Update" : "Add Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}