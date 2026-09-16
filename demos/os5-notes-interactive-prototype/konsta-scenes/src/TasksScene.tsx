import { useMemo, useState, type FormEvent } from "react";
import { Button } from "konsta/react";
import { createPortal } from "react-dom";
import type { HostBridge, SceneSnapshot, TaskRecord } from "./types";
import { DetailSheet, LegacyIcon, PageTitle } from "./shared";
import "./tasks-scene.css";

type TaskFilter = "all" | "week" | "open" | "done";
type TaskItem = Omit<TaskRecord, "children" | "week"> & {
  children?: TaskItem[];
  week?: boolean;
  pinned?: boolean;
};
type TasksHostBridge = HostBridge & {
  toggleTask: (id: string) => SceneSnapshot;
  saveTask: (task: TaskRecord) => SceneSnapshot;
};
type EditorState = { mode: "create" } | { mode: "edit"; task: TaskItem } | null;
type ChildDraft = { id?: string; title: string; time: string; reminder: boolean; done: boolean };

const SOURCE_NOTE_ID = "launch-speech-draft";
const SOURCE_NOTE_TITLE = "发布会演讲初稿";
const FILTERS: Array<{ value: TaskFilter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "week", label: "本周" },
  { value: "open", label: "未完成" },
  { value: "done", label: "已完成" },
];

function isWeekLabel(value?: string): boolean {
  return /今天|明天|本周|周[一二三四五六日天]/.test(value ?? "");
}

function isWeekTask(task: TaskItem): boolean {
  return Boolean(task.week || isWeekLabel(task.time) || task.children?.some(isWeekTask));
}

function matchesFilter(task: TaskItem, filter: TaskFilter): boolean {
  switch (filter) {
    case "week":
      return isWeekTask(task);
    case "open":
      return !task.done;
    case "done":
      return task.done;
    case "all":
      return true;
  }
}

function projectTask(task: TaskItem, filter: TaskFilter): TaskItem | null {
  if (filter === "all" || !task.children?.length) {
    return matchesFilter(task, filter) ? task : null;
  }
  const matchingChildren = task.children.filter((child) => matchesFilter(child, filter));
  if (!matchesFilter(task, filter) && matchingChildren.length === 0) return null;
  return {
    ...task,
    children: matchingChildren.length > 0 ? matchingChildren : task.children,
  };
}

function actionableTasks(tasks: TaskItem[]): TaskItem[] {
  return tasks.flatMap((task) => (task.children?.length ? actionableTasks(task.children) : [task]));
}

function hasLaunchSource(task: TaskItem): boolean {
  return task.source === SOURCE_NOTE_ID || task.source === SOURCE_NOTE_TITLE;
}

function isPriorityTask(task: TaskItem): boolean {
  return task.pinned || task.id === "draft" || hasLaunchSource(task);
}

function normalizeLegacyTask(task: TaskItem): TaskItem {
  return task.id === "draft" && task.source === undefined ? { ...task, source: SOURCE_NOTE_ID } : task;
}

function TaskToggle({
  host,
  task,
  onToggle,
}: {
  host: TasksHostBridge;
  task: TaskItem;
  onToggle: (id: string) => void;
}) {
  return (
    <Button
      clear
      className={`tasks-latest-check ${task.done ? "is-checked" : ""}`}
      data-konsta-role="task-toggle"
      data-testid={`task-toggle-${task.id}`}
      role="checkbox"
      aria-checked={task.done}
      aria-label={`${task.done ? "恢复" : "完成"}：${task.title}`}
      onClick={() => onToggle(task.id)}
    >
      {task.done && <LegacyIcon host={host} name="check" />}
    </Button>
  );
}

function TaskMeta({ host, task }: { host: TasksHostBridge; task: TaskItem }) {
  if (!task.time && !task.category) return null;
  return (
    <span className="tasks-latest-meta">
      {task.time && (
        <span>
          <LegacyIcon host={host} name="alarm" />
          {task.time}
        </span>
      )}
      {task.category && <span>{task.category}</span>}
    </span>
  );
}

function PriorityTaskCard({
  host,
  task,
  onToggle,
  onEdit,
  onSource,
}: {
  host: TasksHostBridge;
  task: TaskItem;
  onToggle: (id: string) => void;
  onEdit: (task: TaskItem) => void;
  onSource?: () => void;
}) {
  return (
    <section className="tasks-latest-priority" data-testid="tasks-priority-card">
      <div className="tasks-latest-priority-label">
        <span>优先处理</span>
        <small>{task.pinned ? "已置顶" : "本周重点"}</small>
      </div>
      <div className={`tasks-latest-priority-main ${task.done ? "is-done" : ""}`}>
        <TaskToggle host={host} task={task} onToggle={onToggle} />
        <Button clear className="tasks-latest-task-copy" onClick={() => onEdit(task)}>
          <strong>{task.title}</strong>
          <TaskMeta host={host} task={task} />
        </Button>
      </div>
      {onSource && (
        <Button
          clear
          className="tasks-latest-source-row"
          data-testid="task-source-note"
          aria-label={`打开来源笔记《${SOURCE_NOTE_TITLE}》`}
          onClick={onSource}
        >
          <span className="tasks-latest-source-icon">
            <LegacyIcon host={host} name="note" />
          </span>
          <span>
            <small>相关笔记</small>
            <strong>《{SOURCE_NOTE_TITLE}》</strong>
          </span>
          <LegacyIcon host={host} name="right" />
        </Button>
      )}
    </section>
  );
}

function TaskCard({
  host,
  task,
  expanded,
  onToggle,
  onExpand,
  onEdit,
}: {
  host: TasksHostBridge;
  task: TaskItem;
  expanded: boolean;
  onToggle: (id: string) => void;
  onExpand: (id: string) => void;
  onEdit: (task: TaskItem) => void;
}) {
  const children = task.children ?? [];
  if (children.length === 0) {
    return (
      <article className={`tasks-latest-task-card ${task.done ? "is-done" : ""}`}>
        <TaskToggle host={host} task={task} onToggle={onToggle} />
        <Button clear className="tasks-latest-task-copy" onClick={() => onEdit(task)}>
          <strong>{task.title}</strong>
          <TaskMeta host={host} task={task} />
        </Button>
        <LegacyIcon host={host} name="right" className="tasks-latest-row-arrow" />
      </article>
    );
  }

  const completed = children.filter((child) => child.done).length;
  return (
    <section className={`tasks-latest-task-group ${task.done ? "is-done" : ""}`}>
      <div className="tasks-latest-group-head">
        <TaskToggle host={host} task={task} onToggle={onToggle} />
        <Button clear className="tasks-latest-task-copy" onClick={() => onEdit(task)}>
          <strong>{task.title}</strong>
          <TaskMeta host={host} task={task} />
        </Button>
        <span className="tasks-latest-progress-count">
          {completed}/{children.length}
        </span>
        <Button
          clear
          className="tasks-latest-expand"
          data-testid={`task-expand-${task.id}`}
          aria-expanded={expanded}
          aria-label={`${expanded ? "收起" : "展开"}${task.title}`}
          onClick={() => onExpand(task.id)}
        >
          <LegacyIcon host={host} name={expanded ? "up" : "down"} />
        </Button>
      </div>
      {expanded && (
        <div className="tasks-latest-children">
          {children.map((child) => (
            <div className={`tasks-latest-child ${child.done ? "is-done" : ""}`} key={child.id}>
              <TaskToggle host={host} task={child} onToggle={onToggle} />
              <div className="tasks-latest-child-copy">
                <strong>{child.title}</strong>
                <TaskMeta host={host} task={child} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function TasksFab({ host, onClick }: { host: TasksHostBridge; onClick: () => void }) {
  const button = (
    <Button
      clear
      className="tasks-latest-fab"
      data-konsta-role="task-create"
      data-testid="task-fab"
      aria-label="新建待办"
      onClick={onClick}
    >
      <LegacyIcon host={host} name="plus" />
    </Button>
  );
  const target = typeof document === "undefined" ? null : document.getElementById("floating-bar");
  return target ? createPortal(button, target) : <div className="tasks-latest-fab-fallback">{button}</div>;
}

function TaskEditor({
  host,
  task,
  hidden,
  onClose,
  onOpenSource,
  onSave,
}: {
  host: TasksHostBridge;
  task?: TaskItem;
  hidden: boolean;
  onClose: () => void;
  onOpenSource: () => void;
  onSave: (task: TaskItem) => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [mainReminder, setMainReminder] = useState(Boolean(task?.time));
  const [time, setTime] = useState(task?.time ?? "今天 18:00");
  const [pinned, setPinned] = useState(task?.pinned ?? false);
  const [linked, setLinked] = useState(task ? hasLaunchSource(task) : false);
  const [children, setChildren] = useState<ChildDraft[]>(() =>
    Array.from({ length: 3 }, (_, index) => {
      const child = task?.children?.[index];
      return {
        id: child?.id,
        title: child?.title ?? "",
        time: child?.time ?? "",
        reminder: Boolean(child?.time),
        done: child?.done ?? false,
      };
    }),
  );

  const updateChild = (index: number, patch: Partial<ChildDraft>) => {
    setChildren((current) => current.map((child, childIndex) => (childIndex === index ? { ...child, ...patch } : child)));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    const id = task?.id ?? `task-${Date.now().toString(36)}`;
    const nextChildren: TaskItem[] = children
      .filter((child) => child.title.trim())
      .map((child, index) => ({
        id: child.id ?? `${id}-child-${index + 1}`,
        title: child.title.trim(),
        time: child.reminder ? child.time.trim() || undefined : undefined,
        category: task?.category,
        source: linked ? SOURCE_NOTE_ID : undefined,
        done: child.done,
        week: task?.week,
      }));
    const originalSource = task?.source;
    const source = linked
      ? SOURCE_NOTE_ID
      : originalSource === SOURCE_NOTE_ID || originalSource === SOURCE_NOTE_TITLE
        ? task?.id === "draft"
          ? ""
          : undefined
        : originalSource;
    onSave({
      ...task,
      id,
      title: trimmedTitle,
      time: mainReminder ? time.trim() || undefined : undefined,
      category: task?.category,
      source,
      done: task?.done ?? false,
      week: task?.week,
      pinned,
      children: nextChildren,
    });
  };

  if (hidden) return null;

  return (
    <DetailSheet title={task ? "编辑待办" : "新建待办"} onClose={onClose}>
      <form className="detail-form tasks-latest-editor" data-testid="task-editor" onSubmit={submit}>
        <label className="tasks-latest-field">
          <span>待办内容</span>
          <textarea
            autoFocus
            maxLength={200}
            placeholder="写下要完成的事"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <section className="tasks-latest-editor-section">
          <div className="tasks-latest-editor-heading">
            <strong>提醒</strong>
            <Button
              clear
              type="button"
              className={`tasks-latest-switch ${mainReminder ? "is-on" : ""}`}
              role="switch"
              aria-checked={mainReminder}
              aria-label="待办提醒"
              onClick={() => setMainReminder((value) => !value)}
            >
              <span />
            </Button>
          </div>
          {mainReminder && (
            <label className="tasks-latest-reminder-input">
              <LegacyIcon host={host} name="alarm" />
              <input aria-label="待办提醒时间" value={time} onChange={(event) => setTime(event.target.value)} />
            </label>
          )}
        </section>

        <section className="tasks-latest-editor-section">
          <div className="tasks-latest-editor-heading">
            <strong>子项</strong>
            <small>最多三条，可逐项提醒</small>
          </div>
          <div className="tasks-latest-child-editors">
            {children.map((child, index) => (
              <div className="tasks-latest-child-editor" key={index}>
                <div className="tasks-latest-child-title-row">
                  <span>{index + 1}</span>
                  <input
                    aria-label={`子项 ${index + 1}`}
                    data-testid={`task-child-${index + 1}`}
                    placeholder={`添加子项 ${index + 1}`}
                    value={child.title}
                    onChange={(event) => updateChild(index, { title: event.target.value })}
                  />
                  <Button
                    clear
                    type="button"
                    className={`tasks-latest-reminder-toggle ${child.reminder ? "is-on" : ""}`}
                    data-testid={`task-child-reminder-${index + 1}`}
                    aria-pressed={child.reminder}
                    aria-label={`${child.reminder ? "关闭" : "开启"}子项 ${index + 1} 提醒`}
                    onClick={() => updateChild(index, { reminder: !child.reminder })}
                  >
                    <LegacyIcon host={host} name="alarm" />
                  </Button>
                </div>
                {child.reminder && (
                  <input
                    className="tasks-latest-child-time"
                    aria-label={`子项 ${index + 1} 提醒时间`}
                    data-testid={`task-child-time-${index + 1}`}
                    placeholder="例如：明天 10:00"
                    value={child.time}
                    onChange={(event) => updateChild(index, { time: event.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="tasks-latest-editor-section tasks-latest-settings">
          <Button
            clear
            type="button"
            className="tasks-latest-setting-row"
            role="switch"
            aria-checked={pinned}
            data-testid="task-pin"
            onClick={() => setPinned((value) => !value)}
          >
            <span className="tasks-latest-setting-mark">↑</span>
            <span>
              <strong>置顶</strong>
              <small>显示在优先处理卡中</small>
            </span>
            <span className={`tasks-latest-switch ${pinned ? "is-on" : ""}`} aria-hidden="true">
              <span />
            </span>
          </Button>
          <div className="tasks-latest-setting-row tasks-latest-related-setting">
            <span className="tasks-latest-setting-mark">
              <LegacyIcon host={host} name="note" />
            </span>
            <Button clear type="button" className="tasks-latest-related-copy" data-testid="task-editor-source-note" onClick={onOpenSource}>
              <strong>相关笔记</strong>
              <small>《{SOURCE_NOTE_TITLE}》</small>
            </Button>
            <Button
              clear
              type="button"
              className={`tasks-latest-switch ${linked ? "is-on" : ""}`}
              role="switch"
              aria-checked={linked}
              aria-label="关联发布会演讲初稿"
              onClick={() => setLinked((value) => !value)}
            >
              <span />
            </Button>
          </div>
        </section>

        <Button className="tasks-latest-save" data-testid="task-save" type="submit" disabled={!title.trim()}>
          保存
        </Button>
      </form>
    </DetailSheet>
  );
}

function SourceNotePage({ host, onBack }: { host: TasksHostBridge; onBack: () => void }) {
  return (
    <main className="page tasks-latest-source-page" data-konsta-background data-testid="task-source-note-page">
      <div className="tasks-latest-topbar">
        <Button clear className="icon-button" data-testid="task-source-back" aria-label="返回待办" onClick={onBack}>
          <LegacyIcon host={host} name="back" />
        </Button>
      </div>
      <header className="tasks-latest-note-header">
        <span>AI 生成笔记</span>
        <h1>{SOURCE_NOTE_TITLE}</h1>
        <p>2026年7月10日 15:10 · AI生成</p>
      </header>
      <article className="tasks-latest-note-body">
        <h2>演讲结构</h2>
        <p>本次发布会演讲分为三个部分：</p>
        <ol>
          <li>开场：回顾上一代产品的市场表现与用户反馈，引出本次升级的核心方向。</li>
          <li>产品亮点：围绕影像、性能、续航三大升级点展开，每个点配一个真实使用场景。</li>
          <li>One More Thing：压轴发布配套生态新品。</li>
        </ol>
        <h2>内容物料准备</h2>
        <p><b>演讲素材：</b>相关素材已分散记录在多篇笔记中，需集中整理定稿。素材定稿是后续 PPT 制作的前置条件，须在明天 17:00 前完成。</p>
        <p><b>发布会 PPT：</b>主视觉 KV 已确定，正文页待制作。需在素材定稿后开始撰写，本周内产出初版供评审。</p>
        <p><b>宣发材料：</b>新闻通稿与预热海报已有草稿，其中“全球首发”的表述须核实合规性后方可对外发布。</p>
        <section className="tasks-latest-note-todos">
          <h3>待办事项</h3>
          {[
            ["定稿笔记素材", "明天 17:00"],
            ["撰写发布会 PPT", ""],
            ["审核宣发材料", ""],
          ].map(([title, time]) => <div key={title}><span aria-hidden="true" /> <p><b>{title}</b>{time && <small>{time}</small>}</p></div>)}
        </section>
      </article>
    </main>
  );
}

export function TasksScene({
  host,
  snapshot,
  onSnapshot,
}: {
  host: TasksHostBridge;
  snapshot: SceneSnapshot;
  onSnapshot: (next: SceneSnapshot) => void;
}) {
  const tasks = useMemo(() => (snapshot.tasks as TaskItem[]).map(normalizeLegacyTask), [snapshot.tasks]);
  const initialFilter = snapshot.entry?.tasksFilter ?? "all";
  const [filter, setFilter] = useState<TaskFilter>(initialFilter);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(tasks.find((task) => task.children?.length)?.id ? [tasks.find((task) => task.children?.length)?.id as string] : []),
  );
  const [editor, setEditor] = useState<EditorState>(null);
  const [sourceOpen, setSourceOpen] = useState(false);

  const leafTasks = useMemo(() => actionableTasks(tasks), [tasks]);
  const openCount = leafTasks.filter((task) => !task.done).length;
  const priorityTasks = useMemo(
    () => tasks.filter((task) => !task.done && !task.children?.length && (task.week || isPriorityTask(task))).slice(0, 3),
    [tasks],
  );
  const visiblePriorityTasks = priorityTasks.filter((task) => matchesFilter(task, filter));
  const priorityIds = new Set(priorityTasks.map((task) => task.id));
  const priorityVisible = filter !== "done" && visiblePriorityTasks.length > 0;
  const visibleTasks = useMemo(
    () =>
      tasks
        .map((task) => projectTask(task, filter))
        .filter((task): task is TaskItem => Boolean(task))
        .filter((task) => !priorityIds.has(task.id))
        .sort((left, right) => left.id === "furnish" ? -1 : right.id === "furnish" ? 1 : 0),
    [filter, tasks, priorityTasks],
  );

  const toggleTask = (id: string) => onSnapshot(host.toggleTask(id));
  const toggleExpanded = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const saveTask = (task: TaskItem) => {
    const next = host.saveTask(task);
    onSnapshot(next);
    setEditor(null);
    host.toast(editor?.mode === "edit" ? "待办已更新" : "待办已创建");
  };
  const openSource = () => setSourceOpen(true);

  return (
    <div className="konsta-scene tasks-latest-scene" data-konsta-scene="tasks">
      {sourceOpen ? (
        <SourceNotePage host={host} onBack={() => setSourceOpen(false)} />
      ) : (
        <>
          <main className="page tasks-latest-page" data-konsta-background>
            <div className="tasks-latest-topbar">
              <Button clear className="icon-button" data-konsta-role="back" aria-label="返回合集" onClick={host.back}>
                <LegacyIcon host={host} name="back" />
              </Button>
            </div>
            <h1 className="page-title">待办</h1>

            <div className="tasks-latest-filters" role="group" aria-label="筛选待办">
              {FILTERS.map((item) => (
                <Button
                  clear
                  key={item.value}
                  className={filter === item.value ? "is-active" : ""}
                  data-testid={`tasks-filter-${item.value}`}
                  aria-pressed={filter === item.value}
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            {priorityVisible && (
              <section className="tasks-latest-priority" data-testid="tasks-priority-card">
                <div className="tasks-latest-priority-label">
                  <span><LegacyIcon host={host} name="list" />优先处理</span>
                </div>
                <div className="tasks-latest-priority-list">
                  {visiblePriorityTasks.map((task) => (
                    <div className={`tasks-latest-priority-row ${task.done ? "is-done" : ""}`} key={task.id}>
                      <TaskToggle host={host} task={task} onToggle={toggleTask} />
                      <Button clear className="tasks-latest-task-copy" onClick={() => setEditor({ mode: "edit", task })}>
                        <strong>{task.title}</strong>
                        <TaskMeta host={host} task={task} />
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="tasks-latest-list-section">
              <div className="tasks-latest-section-heading">
                <h2>{FILTERS.find((item) => item.value === filter)?.label}</h2>
                <span>{visibleTasks.length + (priorityVisible ? 1 : 0)} 项</span>
              </div>
              <div className="tasks-latest-list">
                {visibleTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    host={host}
                    task={task}
                    expanded={expanded.has(task.id)}
                    onToggle={toggleTask}
                    onExpand={toggleExpanded}
                    onEdit={(item) => setEditor({ mode: "edit", task: item })}
                  />
                ))}
                {visibleTasks.length === 0 && !priorityVisible && (
                  <div className="tasks-latest-empty">
                    <LegacyIcon host={host} name="check" />
                    <strong>这里暂时没有待办</strong>
                    <p>切换筛选，或新建一条待办。</p>
                  </div>
                )}
              </div>
            </section>
          </main>
          <TasksFab host={host} onClick={() => setEditor({ mode: "create" })} />
        </>
      )}
      {editor && (
        <TaskEditor
          key={editor.mode === "edit" ? editor.task.id : "new-task"}
          host={host}
          task={editor.mode === "edit" ? editor.task : undefined}
          hidden={sourceOpen}
          onClose={() => setEditor(null)}
          onOpenSource={openSource}
          onSave={saveTask}
        />
      )}
    </div>
  );
}
