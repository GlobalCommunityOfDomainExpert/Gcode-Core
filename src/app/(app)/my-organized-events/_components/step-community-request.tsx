"use client";

import { useState } from "react";
import {
  Card,
  RemoveIconButton,
  SectionLabel,
  Textarea,
} from "@/components/atoms";
import {
  FormField,
  SearchBar,
  StakeholderCard,
  Tabs,
} from "@/components/molecules";
import {
  getStakeholderById,
  mockStakeholders,
  stakeholderCategories,
  StakeholderCategory,
} from "@/lib/community-requests";
import { SelectedStakeholder } from "@/lib/zod/event";

const categoryTabs = stakeholderCategories.map((category) => ({
  value: category,
  label: category,
}));

export interface StepCommunityRequestProps {
  selected: SelectedStakeholder[];
  onChange: (selected: SelectedStakeholder[]) => void;
}

export function StepCommunityRequest({
  selected,
  onChange,
}: StepCommunityRequestProps) {
  const [activeCategory, setActiveCategory] = useState(categoryTabs[0].value);
  const [query, setQuery] = useState("");

  const filtered = mockStakeholders.filter((stakeholder) => {
    if (stakeholder.category !== activeCategory) return false;
    if (!query.trim()) return true;
    const haystack =
      `${stakeholder.name} ${stakeholder.org ?? ""} ${stakeholder.id}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  function toggleStakeholder(stakeholderId: string) {
    const isSelected = selected.some(
      (item) => item.stakeholderId === stakeholderId,
    );
    if (isSelected) {
      onChange(selected.filter((item) => item.stakeholderId !== stakeholderId));
      return;
    }
    const stakeholder = getStakeholderById(stakeholderId);
    if (!stakeholder) return;
    onChange([
      ...selected,
      { stakeholderId, category: stakeholder.category, message: "" },
    ]);
  }

  function updateMessage(stakeholderId: string, message: string) {
    onChange(
      selected.map((item) =>
        item.stakeholderId === stakeholderId ? { ...item, message } : item,
      ),
    );
  }

  function removeStakeholder(stakeholderId: string) {
    onChange(selected.filter((item) => item.stakeholderId !== stakeholderId));
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-large text-text-primary font-semibold">
          Request community help
        </h2>
        <p className="text-body text-text-secondary">
          Optional — ask venue partners, sponsors, guest speakers, or volunteers
          to help with this event. Skip this if you don&apos;t need help yet.
        </p>
      </div>

      <div className="space-y-3">
        <Tabs
          items={categoryTabs}
          value={activeCategory}
          onChange={(value) => setActiveCategory(value as StakeholderCategory)}
        />
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder={`Search ${activeCategory.toLowerCase()}s by name...`}
        />
        {filtered.length === 0 ? (
          <p className="border-border-light bg-bg-light text-body text-text-secondary rounded-md border p-6 text-center">
            No matches. Try a different search.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((stakeholder) => (
              <StakeholderCard
                key={stakeholder.id}
                avatarInitials={stakeholder.avatarInitials}
                name={stakeholder.name}
                category={stakeholder.category}
                org={stakeholder.org}
                bio={stakeholder.bio}
                tags={stakeholder.tags}
                selected={selected.some(
                  (item) => item.stakeholderId === stakeholder.id,
                )}
                onAction={() => toggleStakeholder(stakeholder.id)}
              />
            ))}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="border-border-light space-y-3 border-t pt-4">
          <SectionLabel>Requested ({selected.length})</SectionLabel>
          {selected.map((item) => {
            const stakeholder = getStakeholderById(item.stakeholderId);
            if (!stakeholder) return null;
            return (
              <Card key={item.stakeholderId} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-body text-text-primary font-semibold">
                      {stakeholder.name}
                    </p>
                    <p className="text-small text-text-secondary">
                      {stakeholder.category}
                    </p>
                  </div>
                  <RemoveIconButton
                    onClick={() => removeStakeholder(item.stakeholderId)}
                    ariaLabel={`Remove ${stakeholder.name}`}
                  />
                </div>
                <FormField
                  label={`Message to ${stakeholder.name}`}
                  htmlFor={`message-${item.stakeholderId}`}
                >
                  <Textarea
                    id={`message-${item.stakeholderId}`}
                    value={item.message}
                    onChange={(event) =>
                      updateMessage(item.stakeholderId, event.target.value)
                    }
                    placeholder="What kind of help do you need from them?"
                    rows={2}
                  />
                </FormField>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
