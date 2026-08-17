"use client";

import {
  Button,
  Card,
  Checkbox,
  Icon,
  Input,
  RemoveIconButton,
  Textarea,
} from "@/components/atoms";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FormField, ToggleGroup } from "@/components/molecules";
import { UpdateEventDetailData, EventDetailData } from "@/lib/zod/event";

type RoundItem = EventDetailData["rounds"][number];
type RubricCriterionItem = RoundItem["rubric"][number];

function withAddedItem<T>(list: T[], item: T): T[] {
  return [...list, item];
}

function withUpdatedItem<T>(
  list: T[],
  index: number,
  updater: (item: T) => T,
): T[] {
  return list.map((item, itemIndex) =>
    itemIndex === index ? updater(item) : item,
  );
}

function withRemovedItem<T>(list: T[], index: number): T[] {
  return list.filter((_, itemIndex) => itemIndex !== index);
}

// Swaps item at `index` with its neighbor — order becomes
// GCODE_EVENT_ROUNDS.sort_order on save, same convention as the timeline
// step's reorder arrows.
function withMovedItem<T>(
  list: T[],
  index: number,
  direction: "up" | "down",
): T[] {
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export interface StepRoundsProps {
  data: EventDetailData;
  onChange: UpdateEventDetailData;
}

export function StepRounds({ data, onChange }: StepRoundsProps) {
  function moveRound(index: number, direction: "up" | "down") {
    onChange("rounds", withMovedItem(data.rounds, index, direction));
  }

  function addRound() {
    onChange(
      "rounds",
      withAddedItem(data.rounds, {
        id: null,
        name: "",
        description: "",
        mode: "OFFLINE" as const,
        rubric: [],
        shortlistCount: 0,
        date: "",
        startTime: "",
        endTime: "",
        judgeWeight: 70,
        audienceWeight: 30,
        judgeScoringEnabled: false,
        audienceScoringEnabled: false,
      }),
    );
  }

  function updateRound<K extends keyof RoundItem>(
    index: number,
    field: K,
    value: RoundItem[K],
  ) {
    onChange(
      "rounds",
      withUpdatedItem(data.rounds, index, (item) => ({
        ...item,
        [field]: value,
      })),
    );
  }

  function removeRound(index: number) {
    onChange("rounds", withRemovedItem(data.rounds, index));
  }

  function addCriterion(roundIndex: number) {
    updateRound(
      roundIndex,
      "rubric",
      withAddedItem(data.rounds[roundIndex].rubric, {
        id: null,
        label: "",
        maxScore: 10,
      }),
    );
  }

  function updateCriterion<K extends keyof RubricCriterionItem>(
    roundIndex: number,
    criterionIndex: number,
    field: K,
    value: RubricCriterionItem[K],
  ) {
    updateRound(
      roundIndex,
      "rubric",
      withUpdatedItem(data.rounds[roundIndex].rubric, criterionIndex, (c) => ({
        ...c,
        [field]: value,
      })),
    );
  }

  function removeCriterion(roundIndex: number, criterionIndex: number) {
    updateRound(
      roundIndex,
      "rubric",
      withRemovedItem(data.rounds[roundIndex].rubric, criterionIndex),
    );
  }

  // Weights are kept summed to 100 by construction — editing one side sets
  // the other, rather than letting them drift and warning about it. Only
  // shown/meaningful when both scoring toggles are on for a round.
  function updateJudgeWeight(index: number, value: number) {
    const clamped = Math.max(0, Math.min(100, value));
    onChange(
      "rounds",
      withUpdatedItem(data.rounds, index, (item) => ({
        ...item,
        judgeWeight: clamped,
        audienceWeight: 100 - clamped,
      })),
    );
  }

  function updateAudienceWeight(index: number, value: number) {
    const clamped = Math.max(0, Math.min(100, value));
    onChange(
      "rounds",
      withUpdatedItem(data.rounds, index, (item) => ({
        ...item,
        audienceWeight: clamped,
        judgeWeight: 100 - clamped,
      })),
    );
  }

  // Reuses shortlistCount as the underlying on/off + N value (0 = off) —
  // checking the box seeds a starting N rather than adding a separate
  // enabled flag; unchecking clears back to 0 rather than remembering the
  // last N, so re-checking starts the organizer retyping a fresh value.
  function toggleAutoShortlist(index: number, enabled: boolean) {
    updateRound(
      index,
      "shortlistCount",
      enabled ? Math.max(1, data.rounds[index].shortlistCount) : 0,
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-large text-text-primary font-semibold">Rounds</h2>
        <p className="text-body text-text-secondary">
          Optional — set up multiple stages (e.g. Audition, Live Show) if
          participants get shortlisted between them. Skip if this event is a
          single round.
        </p>
      </div>

      <div className="space-y-3">
        {data.rounds.map((round, index) => {
          // Online: judge scoring via rubric is always on, no toggle.
          // Offline: entirely gated by the two explicit toggles below.
          const rubricVisible =
            round.mode === "ONLINE" || round.judgeScoringEnabled;
          const hasScoring =
            round.mode === "ONLINE"
              ? round.rubric.length > 0
              : round.judgeScoringEnabled || round.audienceScoringEnabled;
          return (
            <Card key={index} className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-body text-text-primary font-semibold">
                  Round {index + 1}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveRound(index, "up")}
                    disabled={index === 0}
                    aria-label={`Move round ${index + 1} up`}
                    className="text-text-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Icon icon={ChevronUp} size="sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveRound(index, "down")}
                    disabled={index === data.rounds.length - 1}
                    aria-label={`Move round ${index + 1} down`}
                    className="text-text-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Icon icon={ChevronDown} size="sm" />
                  </button>
                  <RemoveIconButton
                    onClick={() => removeRound(index)}
                    ariaLabel={`Remove round ${index + 1}`}
                  />
                </div>
              </div>

              <FormField label="Name" htmlFor={`round-name-${index}`}>
                <Input
                  id={`round-name-${index}`}
                  value={round.name}
                  onChange={(event) =>
                    updateRound(index, "name", event.target.value)
                  }
                  placeholder="e.g. Round 1: Audition"
                />
              </FormField>

              <FormField
                label="Description"
                htmlFor={`round-description-${index}`}
              >
                <Textarea
                  id={`round-description-${index}`}
                  value={round.description}
                  onChange={(event) =>
                    updateRound(index, "description", event.target.value)
                  }
                  placeholder="What happens in this round?"
                  rows={2}
                />
              </FormField>

              <FormField label="Mode" htmlFor={`round-mode-${index}`}>
                <ToggleGroup
                  options={[
                    { value: "OFFLINE", label: "Offline" },
                    { value: "ONLINE", label: "Online" },
                  ]}
                  value={round.mode}
                  onChange={(value) =>
                    updateRound(index, "mode", value as "ONLINE" | "OFFLINE")
                  }
                />
              </FormField>

              {round.mode === "OFFLINE" && (
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <Checkbox
                    id={`round-judge-scoring-${index}`}
                    label="Enable Judge Scoring"
                    checked={round.judgeScoringEnabled}
                    onChange={(event) =>
                      updateRound(
                        index,
                        "judgeScoringEnabled",
                        event.target.checked,
                      )
                    }
                  />
                  <Checkbox
                    id={`round-audience-scoring-${index}`}
                    label="Enable Audience Scoring"
                    checked={round.audienceScoringEnabled}
                    onChange={(event) =>
                      updateRound(
                        index,
                        "audienceScoringEnabled",
                        event.target.checked,
                      )
                    }
                  />
                </div>
              )}

              {round.mode === "OFFLINE" &&
                !round.judgeScoringEnabled &&
                !round.audienceScoringEnabled && (
                  <p className="text-small text-text-secondary">
                    No scoring enabled — Shortlist/Reject will be a fully manual
                    decision for this round, guided by no rank.
                  </p>
                )}

              {rubricVisible && (
                <div className="space-y-2">
                  <p className="text-body text-text-primary font-medium">
                    Judging rubric
                  </p>
                  <p className="text-small text-text-secondary">
                    {round.mode === "OFFLINE"
                      ? "At least one criterion is required while Judge Scoring is on."
                      : "Optional — add scored criteria (e.g. Creativity, Technical) for judges to rate participants against in this round. Leave empty for a plain Shortlist/Reject decision."}
                  </p>
                  {round.mode === "OFFLINE" &&
                    round.judgeScoringEnabled &&
                    round.rubric.length === 0 && (
                      <p className="text-small text-warning">
                        Add at least one criterion below, or turn off Judge
                        Scoring for this round.
                      </p>
                    )}
                  {round.rubric.map((criterion, criterionIndex) => (
                    <div key={criterionIndex} className="flex items-end gap-2">
                      <div className="flex-1">
                        <FormField
                          label="Criterion"
                          htmlFor={`round-rubric-label-${index}-${criterionIndex}`}
                        >
                          <Input
                            id={`round-rubric-label-${index}-${criterionIndex}`}
                            value={criterion.label}
                            onChange={(event) =>
                              updateCriterion(
                                index,
                                criterionIndex,
                                "label",
                                event.target.value,
                              )
                            }
                            placeholder="e.g. Creativity"
                          />
                        </FormField>
                      </div>
                      <div className="w-24">
                        <FormField
                          label="Max score"
                          htmlFor={`round-rubric-max-${index}-${criterionIndex}`}
                        >
                          <Input
                            id={`round-rubric-max-${index}-${criterionIndex}`}
                            type="number"
                            min={1}
                            value={criterion.maxScore}
                            onChange={(event) =>
                              updateCriterion(
                                index,
                                criterionIndex,
                                "maxScore",
                                Number(event.target.value),
                              )
                            }
                          />
                        </FormField>
                      </div>
                      <RemoveIconButton
                        onClick={() => removeCriterion(index, criterionIndex)}
                        ariaLabel={`Remove criterion ${criterionIndex + 1}`}
                      />
                    </div>
                  ))}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => addCriterion(index)}
                  >
                    + Add criterion
                  </Button>
                </div>
              )}

              {/* Weight fields only mean anything once both scoring sources
                are on — a single active source is already 100% of the
                blended score regardless of the number here. Editing one
                side sets the other so they're always exactly 100, no
                separate mismatch warning needed. */}
              {round.mode === "OFFLINE" &&
                round.judgeScoringEnabled &&
                round.audienceScoringEnabled && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      label="Judge Weight %"
                      htmlFor={`round-judge-weight-${index}`}
                      hint="Blends judge scores with audience ratings for this round's live final score."
                    >
                      <Input
                        id={`round-judge-weight-${index}`}
                        type="number"
                        min={0}
                        max={100}
                        value={round.judgeWeight}
                        onChange={(event) =>
                          updateJudgeWeight(index, Number(event.target.value))
                        }
                      />
                    </FormField>
                    <FormField
                      label="Audience Weight %"
                      htmlFor={`round-audience-weight-${index}`}
                    >
                      <Input
                        id={`round-audience-weight-${index}`}
                        type="number"
                        min={0}
                        max={100}
                        value={round.audienceWeight}
                        onChange={(event) =>
                          updateAudienceWeight(
                            index,
                            Number(event.target.value),
                          )
                        }
                      />
                    </FormField>
                  </div>
                )}

              {hasScoring && (
                <div className="space-y-2">
                  <Checkbox
                    id={`round-auto-shortlist-${index}`}
                    label="Auto Shortlist"
                    checked={round.shortlistCount > 0}
                    onChange={(event) =>
                      toggleAutoShortlist(index, event.target.checked)
                    }
                  />
                  {round.shortlistCount > 0 ? (
                    <FormField
                      label="Shortlist top"
                      htmlFor={`round-shortlist-count-${index}`}
                      hint="Once every participant is scored/rated, the top N are auto-Shortlisted and everyone else auto-Rejected."
                    >
                      <Input
                        id={`round-shortlist-count-${index}`}
                        type="number"
                        min={1}
                        className="w-24"
                        value={round.shortlistCount}
                        onChange={(event) =>
                          updateRound(
                            index,
                            "shortlistCount",
                            Math.max(1, Number(event.target.value)),
                          )
                        }
                      />
                    </FormField>
                  ) : (
                    <p className="text-small text-text-secondary">
                      Off — the Rounds tab will rank every participant; you
                      choose how many to Shortlist yourself.
                    </p>
                  )}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField label="Date" htmlFor={`round-date-${index}`}>
                  <Input
                    id={`round-date-${index}`}
                    type="date"
                    value={round.date}
                    onChange={(event) =>
                      updateRound(index, "date", event.target.value)
                    }
                  />
                </FormField>
                <FormField label="Start" htmlFor={`round-start-${index}`}>
                  <Input
                    id={`round-start-${index}`}
                    type="time"
                    value={round.startTime}
                    onChange={(event) =>
                      updateRound(index, "startTime", event.target.value)
                    }
                  />
                </FormField>
                <FormField label="End" htmlFor={`round-end-${index}`}>
                  <Input
                    id={`round-end-${index}`}
                    type="time"
                    value={round.endTime}
                    onChange={(event) =>
                      updateRound(index, "endTime", event.target.value)
                    }
                  />
                </FormField>
              </div>
            </Card>
          );
        })}
        <Button variant="secondary" size="sm" onClick={addRound}>
          + Add round
        </Button>
      </div>
    </div>
  );
}
