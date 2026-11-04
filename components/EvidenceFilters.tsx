"use client";

import Icon, { type IconName } from "@/components/Icon";

export type EvidenceFilterField = {
  key: string;
  label: string;
  chipLabel?: string;
  icon: IconName;
  value: string;
  options: string[];
  allLabel: string;
  onChange: (value: string) => void;
};

export default function EvidenceFilters({ fields, count, onReset, canReset }: {
  fields: EvidenceFilterField[];
  count: number;
  onReset: () => void;
  canReset?: boolean;
}) {
  const active = fields.filter(field => field.value !== "All");

  return <section className="filter-panel evidence-filters" aria-label="Filter the evidence">
    <div className="filter-heading">
      <div className="evidence-filter-title"><span className="evidence-filter-mark"><Icon name="sliders" /></span><div><h2>Refine your view</h2><p>Combine filters to explore the evidence.</p></div></div>
      <button type="button" className="text-button" onClick={onReset} disabled={!(canReset ?? active.length > 0)}><Icon name="reset" />Reset filters</button>
    </div>
    <div className="filter-grid">{fields.map(field => <label key={field.key} className="filter-field evidence-filter-field" data-active={field.value !== "All"}>
      <span className="evidence-filter-label">{field.label}</span>
      <span className="evidence-filter-input">
        <Icon name={field.icon} />
        <select value={field.value} onChange={event => field.onChange(event.target.value)}>
          <option value="All">{field.allLabel}</option>
          {[...new Set(field.options)].filter(value => value && value !== "All").sort().map(value => <option key={value} value={value}>{value}</option>)}
        </select>
        <Icon name="chevron-down" />
      </span>
    </label>)}</div>
    <div className="filter-status">
      <span className="evidence-filter-count" aria-live="polite"><i className="status-dot" /><strong>{count}</strong> studies in view</span>
      <div className="filter-chips">{active.map(field => <button type="button" key={field.key} onClick={() => field.onChange("All")} aria-label={`Remove ${field.label} filter: ${field.value}`}><span className="filter-chip-label">{field.chipLabel ?? field.label}:</span>{field.value}<span aria-hidden="true">×</span></button>)}</div>
    </div>
  </section>;
}
