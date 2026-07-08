"use client";

import { useMemo, useState } from "react";
import { Badge, Blurred, Button, ButtonLink } from "@/components/atoms";
import {
  BulkActionBar,
  Chip,
  Modal,
  Table,
  TableColumn,
} from "@/components/molecules";
import {
  CommunityRequest,
  StakeholderCategory,
  getStakeholderById,
  stakeholderCategories,
  stakeholderCategoryLabel,
} from "@/lib/community-requests";
import { Event } from "@/lib/event";
import { StepCommunityRequest } from "@/app/(app)/my-organized-events/_components/step-community-request";
import { SelectedStakeholder } from "@/lib/zod/event";
import { communityStatusLabel, communityStatusTone } from "./status-maps";

export interface CommunityTabProps {
  event: Event;
  requests: CommunityRequest[];
  onNudge: (id: string) => void;
  onConfirm: (id: string) => void;
  onRemove: (id: string) => void;
  onAddRequests: (selected: SelectedStakeholder[]) => void;
}

const categoryIcon: Record<StakeholderCategory, string> = {
  "Venue Partner": "🏢",
  "Sponsorship Partner": "💰",
  Volunteer: "🙋",
  "Guest Speaker": "🎤",
};

export function CommunityTab({
  event,
  requests,
  onNudge,
  onConfirm,
  onRemove,
  onAddRequests,
}: CommunityTabProps) {
  const [categoryFilter, setCategoryFilter] = useState<
    StakeholderCategory | "all"
  >("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<
    SelectedStakeholder[]
  >([]);

  function handleSendRequests() {
    onAddRequests(pendingSelection);
    setPendingSelection([]);
    setShowRequestModal(false);
  }

  function closeRequestModal() {
    setPendingSelection([]);
    setShowRequestModal(false);
  }

  const categoryCounts = useMemo(() => {
    return stakeholderCategories.map((category) => {
      const inCategory = requests.filter(
        (request) => request.category === category,
      );
      return {
        category,
        total: inCategory.length,
        interested: inCategory.filter((r) => r.status === "interested").length,
        helping: inCategory.filter((r) => r.status === "helping").length,
        passed: inCategory.filter((r) => r.status === "passed").length,
      };
    });
  }, [requests]);

  const filtered = useMemo(
    () =>
      categoryFilter === "all"
        ? requests
        : requests.filter((r) => r.category === categoryFilter),
    [requests, categoryFilter],
  );

  function toggleRow(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? new Set(filtered.map((r) => r.id)) : new Set());
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function bulkNudge() {
    selectedIds.forEach((id) => onNudge(id));
    clearSelection();
  }

  function bulkRemove() {
    selectedIds.forEach((id) => onRemove(id));
    clearSelection();
  }

  const columns: TableColumn<CommunityRequest>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => {
        const stakeholder = getStakeholderById(row.stakeholderId);
        return (
          <Blurred
            label={stakeholder?.name ?? "Stakeholder"}
            className="text-text-primary font-semibold"
          >
            {stakeholder?.name ?? "Unknown"}
          </Blurred>
        );
      },
    },
    {
      key: "category",
      header: "Request Type",
      render: (row) => (
        <Badge variant="muted" tone="neutral" size="sm">
          {categoryIcon[row.category]} {stakeholderCategoryLabel[row.category]}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge
          variant="outline"
          tone={communityStatusTone[row.status]}
          size="sm"
        >
          {communityStatusLabel[row.status]}
        </Badge>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (row) => (
        <span className="text-text-secondary line-clamp-1 max-w-50">
          &ldquo;{row.responseMessage ?? row.message}&rdquo;
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          <ButtonLink
            href={`/events/${event.id}/community-request/${row.id}`}
            variant="ghost"
            size="xs"
          >
            Preview
          </ButtonLink>
          {row.status === "interested" && (
            <button
              type="button"
              onClick={() => onConfirm(row.id)}
              className="text-small text-success rounded-sm px-2 py-1 font-semibold hover:underline"
            >
              Confirm
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(row.id)}
            className="text-small text-danger rounded-sm px-2 py-1 font-semibold hover:underline"
          >
            Remove
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <p className="text-small text-text-secondary flex items-center gap-2 font-bold tracking-widest uppercase">
            Active Community Requests
          </p>
          <span className="bg-border-light h-px flex-1" />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowRequestModal(true)}
          >
            + Request Help
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categoryCounts.map(({ category, interested, helping, passed }) => (
            <div
              key={category}
              className="border-border-light bg-surface-light rounded-md border p-4"
            >
              <div className="mb-1.5 text-xl">{categoryIcon[category]}</div>
              <p className="text-body text-text-primary mb-1 font-bold">
                {stakeholderCategoryLabel[category]}
              </p>
              <p className="text-small text-text-secondary">
                {interested} interested ·{" "}
                <span className="text-success font-semibold">
                  {helping} helping
                </span>{" "}
                · {passed} passed
              </p>
              <button
                type="button"
                onClick={() =>
                  requests
                    .filter(
                      (r) =>
                        r.category === category && r.status === "interested",
                    )
                    .forEach((r) => onNudge(r.id))
                }
                className="text-small text-text-secondary hover:text-text-primary mt-2.5 underline underline-offset-2"
              >
                Send Reminder
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-small text-text-secondary mb-3 flex items-center gap-2 font-bold tracking-widest uppercase">
          Responses <span className="bg-border-light h-px flex-1" />
        </p>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Chip
            selected={categoryFilter === "all"}
            onClick={() => setCategoryFilter("all")}
          >
            All ({requests.length})
          </Chip>
          {categoryCounts.map(({ category, total }) => (
            <Chip
              key={category}
              selected={categoryFilter === category}
              onClick={() => setCategoryFilter(category)}
            >
              {categoryIcon[category]} {stakeholderCategoryLabel[category]} (
              {total})
            </Chip>
          ))}
        </div>

        <div className="mb-3">
          <BulkActionBar
            selectedCount={selectedIds.size}
            onClear={clearSelection}
            actions={[
              {
                label: "📧 Send Reminder",
                onClick: bulkNudge,
                variant: "ghost",
              },
              {
                label: "✕ Remove Selected",
                onClick: bulkRemove,
                variant: "danger-ghost",
              },
            ]}
          />
        </div>

        <Table
          columns={columns}
          rows={filtered}
          rowKey={(row) => row.id}
          selectable
          selectedKeys={selectedIds}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          emptyState={
            <div className="border-border-light bg-surface-light rounded-md border p-8 text-center">
              <p className="text-body text-text-secondary">
                No community requests yet.
              </p>
            </div>
          }
        />
      </div>

      <Modal
        open={showRequestModal}
        onClose={closeRequestModal}
        title="Request community help"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeRequestModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendRequests}
              disabled={pendingSelection.length === 0}
            >
              Send Requests ({pendingSelection.length})
            </Button>
          </>
        }
      >
        <StepCommunityRequest
          selected={pendingSelection}
          onChange={setPendingSelection}
        />
      </Modal>
    </div>
  );
}
