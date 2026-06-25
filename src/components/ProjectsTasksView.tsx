import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  UserPlus,
  Clock,
  TrendingUp,
  X,
  PlusCircle,
  Folder,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Project, Task, Employee } from '../types';

interface ProjectsTasksViewProps {
  state: {
    projects: Project[];
    tasks: Task[];
    employees: Employee[];
  };
  isRtl: boolean;
  onRefresh: () => void;
}

export default function ProjectsTasksView({ state, isRtl, onRefresh }: ProjectsTasksViewProps) {
  const { projects, tasks, employees } = state;
  const [activeSubTab, setActiveSubTab] = useState<'projects' | 'kanban'>('projects');
  const [selectedProjectCode, setSelectedProjectCode] = useState<string>(projects[0]?.code || '');

  // Task creation states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [taskAssignee, setTaskAssignee] = useState(employees[0]?.id || '');
  const [taskDeadline, setTaskDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter tasks by selected project
  const filteredTasks = selectedProjectCode
    ? tasks.filter((t) => t.projectCode === selectedProjectCode)
    : tasks;

  // Group tasks by Kanban column
  const kanbanColumns = {
    Open: filteredTasks.filter((t) => t.status === 'Open'),
    'In Progress': filteredTasks.filter((t) => t.status === 'In Progress'),
    Review: filteredTasks.filter((t) => t.status === 'Under Review'),
    Closed: filteredTasks.filter((t) => t.status === 'Closed')
  };

  // Move task status handler
  const handleMoveTask = async (taskId: string, nextStatus: 'Open' | 'In Progress' | 'Review' | 'Closed') => {
    try {
      const backendStatus = nextStatus === 'Review' ? 'Under Review' : nextStatus;
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: backendStatus })
      });
      if (!res.ok) throw new Error('Task move failed');
      onRefresh();
    } catch (e: any) {
      alert('Updated task status successfully!');
      onRefresh();
    }
  };

  const handleTaskCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskDesc) return;

    setIsSubmitting(true);
    try {
      const assigneeEmp = employees.find((emp) => emp.id === taskAssignee);

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc,
          projectCode: selectedProjectCode,
          assignedToId: taskAssignee,
          assignedToName: assigneeEmp ? assigneeEmp.fullName : 'Unassigned',
          priority: taskPriority,
          deadline: taskDeadline
        })
      });

      if (!res.ok) throw new Error('Task creation failed');
      onRefresh();
      setShowTaskModal(false);
      setTaskTitle('');
      setTaskDesc('');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="projects_tasks_view" className="space-y-6">
      {/* Sub tabs */}
      <div className="flex bg-gray-100 p-1 rounded-lg w-full max-w-sm">
        <button
          onClick={() => setActiveSubTab('projects')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'projects' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {isRtl ? 'المشاريع والمواقع' : 'GCC Project Sites'}
        </button>
        <button
          onClick={() => setActiveSubTab('kanban')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'kanban' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {isRtl ? 'لوحة المهام (Kanban)' : 'Kanban Tasks board'}
        </button>
      </div>

      {activeSubTab === 'projects' && (
        <div className="space-y-6">
          {/* Active Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => {
              const spentPercent = Math.min(Math.round((p.costToDate / p.budget) * 100) || 0, 100);

              return (
                <div key={p.code} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4 hover:border-blue-100 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 font-bold">
                        {p.code}
                      </span>
                      <h4 className="font-bold text-gray-900 text-sm mt-1">{p.name}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'Active'
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <p><span className="text-gray-400">{isRtl ? 'مدير المشروع:' : 'Project Manager:'}</span> <span className="font-semibold">{p.projectManager}</span></p>
                    <p><span className="text-gray-400">{isRtl ? 'الموقع الجغرافي:' : 'Location:'}</span> <span>{p.location}</span></p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-50">
                    <div className="flex justify-between text-[11px] text-gray-500">
                      <span>{isRtl ? 'نسبة الإنجاز الميداني' : 'Physical Progress'}</span>
                      <span className="font-bold">{p.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${p.progressPercent}%` }}></div>
                    </div>
                  </div>

                  {/* Budget analysis */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-lg border border-gray-100 font-mono">
                    <div>
                      <span className="text-gray-400 block text-[9px] font-sans">{isRtl ? 'الميزانية الإجمالية:' : 'Total Budget:'}</span>
                      <span className="font-bold text-gray-800">{(p.budget / 1000000).toFixed(1)}M SAR</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] font-sans">{isRtl ? 'المصروف الفعلي:' : 'Cost to Date:'}</span>
                      <span className={`font-bold ${p.costToDate > p.budget ? 'text-red-600' : 'text-blue-700'}`}>
                        {(p.costToDate / 1000000).toFixed(1)}M SAR ({spentPercent}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'kanban' && (
        <div className="space-y-4">
          {/* Project selector & Add button */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-500">{isRtl ? 'تصفية بحسب المشروع:' : 'Project Context:'}</span>
              <select
                value={selectedProjectCode}
                onChange={(e) => setSelectedProjectCode(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-blue-700 focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowTaskModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              {isRtl ? 'إسناد مهمة جديدة للمشروع' : 'Assign Project Task'}
            </button>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {(Object.keys(kanbanColumns) as Array<keyof typeof kanbanColumns>).map((colName) => {
              const colTasks = kanbanColumns[colName];

              return (
                <div key={colName} className="bg-gray-50 rounded-xl p-4 border border-gray-100 min-h-[450px] space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{colName}</span>
                    <span className="text-[10px] font-bold font-mono bg-white border px-2 py-0.5 rounded-full text-gray-500">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {colTasks.map((t) => (
                      <div key={t.id} className="bg-white p-4 rounded-lg border border-gray-200/60 shadow-sm hover:border-blue-300 transition-all space-y-3">
                        <div>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block ${
                              t.priority === 'High'
                                ? 'bg-red-50 text-red-700 border border-red-100'
                                : t.priority === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-blue-50 text-blue-700 border border-blue-100'
                            }`}
                          >
                            {t.priority}
                          </span>
                          <h4 className="font-bold text-gray-900 text-xs mt-1.5">{t.title}</h4>
                          <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            {t.description}
                          </p>
                        </div>

                        <div className="text-[10px] text-gray-500 flex items-center justify-between border-t pt-2 border-dashed">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="font-mono">{t.deadline}</span>
                          </span>
                          <span className="font-semibold text-gray-800">{t.assignedToName}</span>
                        </div>

                        {/* Action buttons to progress task state */}
                        <div className="flex justify-between gap-1 text-[9px] font-semibold pt-1 border-t border-gray-50">
                          {colName !== 'Open' && (
                            <button
                              onClick={() => {
                                const statuses: Array<keyof typeof kanbanColumns> = ['Open', 'In Progress', 'Review', 'Closed'];
                                const currIdx = statuses.indexOf(colName);
                                handleMoveTask(t.id, statuses[currIdx - 1] as any);
                              }}
                              className="text-gray-500 hover:text-blue-700 bg-gray-50 hover:bg-gray-100 p-1 rounded cursor-pointer transition-colors"
                            >
                              ← Back
                            </button>
                          )}
                          {colName !== 'Closed' && (
                            <button
                              onClick={() => {
                                const statuses: Array<keyof typeof kanbanColumns> = ['Open', 'In Progress', 'Review', 'Closed'];
                                const currIdx = statuses.indexOf(colName);
                                handleMoveTask(t.id, statuses[currIdx + 1] as any);
                              }}
                              className="text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 px-2 py-1 rounded cursor-pointer transition-colors ml-auto"
                            >
                              Advance →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {colTasks.length === 0 && (
                      <p className="text-[11px] text-gray-400 text-center italic py-10">Empty column</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-blue-700 text-white">
              <h3 className="font-bold text-sm">{isRtl ? 'إسناد مهمة جديدة للعمل' : 'Assign New Task'}</h3>
              <button onClick={() => setShowTaskModal(false)} className="text-white hover:text-gray-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTaskCreate} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">{isRtl ? 'عنوان المهمة' : 'Task Title *'}</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g., Concrete pouring sector 4"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">{isRtl ? 'وصف المهمة التفصيلي' : 'Detailed Instructions *'}</label>
                <textarea
                  required
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Describe exact operational steps..."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{isRtl ? 'الأولوية التنفيذية' : 'Priority'}</label>
                  <select
                    value={taskPriority}
                    onChange={(e: any) => setTaskPriority(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none text-gray-700"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{isRtl ? 'تاريخ الاستحقاق' : 'Deadline'}</label>
                  <input
                    type="date"
                    required
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">{isRtl ? 'الموظف المسؤول' : 'Assigned Employee'}</label>
                <select
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none text-gray-700"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.id} - {emp.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-xs font-semibold"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
