import React from 'react';

const DayRow = ({ label, dayKey, value = {}, onChange }) => {
  const v = value || {};
  return (
    <div className="grid grid-cols-12 gap-2 items-center py-1">
      <div className="col-span-3 text-sm text-gray-700">{label}</div>
      <div className="col-span-4">
        <input type="time" className="w-full border rounded px-2 py-1" value={v.start || ''}
          onChange={(e) => onChange(dayKey, { ...v, start: e.target.value })} />
      </div>
      <div className="col-span-4">
        <input type="time" className="w-full border rounded px-2 py-1" value={v.end || ''}
          onChange={(e) => onChange(dayKey, { ...v, end: e.target.value })} />
      </div>
      <div className="col-span-1 text-right">
        <input type="checkbox" checked={v.active ?? true} onChange={(e) => onChange(dayKey, { ...v, active: e.target.checked })} />
      </div>
    </div>
  );
};

const WorkingHoursForm = ({ value = {}, onChange }) => {
  const setDay = (k, val) => onChange({ ...value, [k]: val });
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2 text-xs text-gray-500">
        <div className="col-span-3">Day</div>
        <div className="col-span-4">Start</div>
        <div className="col-span-4">End</div>
        <div className="col-span-1 text-right">Active</div>
      </div>
      {[
        ['monday','Monday'],['tuesday','Tuesday'],['wednesday','Wednesday'],['thursday','Thursday'],['friday','Friday'],['saturday','Saturday'],['sunday','Sunday']
      ].map(([k,l]) => (
        <DayRow key={k} label={l} dayKey={k} value={value?.[k]} onChange={(dayKey, val) => setDay(dayKey, val)} />
      ))}
    </div>
  );
};

export default WorkingHoursForm;
