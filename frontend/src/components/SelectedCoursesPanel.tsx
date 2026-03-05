import { useScheduleStore } from "../store/useScheduleStore";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Select } from "./ui/select";
import { Trash2, Calendar, BookOpen, MapPin, User, ExternalLink, Star, Users } from "lucide-react";
import { formatMeetingPattern } from "../lib/schedule";
import { useDraggable } from "@dnd-kit/core";
import { CourseComponent } from "../lib/types";

export function SelectedCoursesPanel() {
  const selectedCourses = useScheduleStore((s) => s.selectedCourses);
  const removeCourse = useScheduleStore((s) => s.removeCourse);
  const selectedLectureSectionByCourseId = useScheduleStore((s) => s.selectedLectureSectionByCourseId);
  const selectedLabSectionByCourseId = useScheduleStore((s) => s.selectedLabSectionByCourseId);
  const setLectureSection = useScheduleStore((s) => s.setLectureSection);
  const setLabSection = useScheduleStore((s) => s.setLabSection);
  const isBlockingMode = useScheduleStore((s) => s.isBlockingMode);

  if (selectedCourses.length === 0) {
    return (
      <div className="text-[14px] text-portal-text-secondary p-[12px] text-center border border-portal-border rounded-none">
        No courses selected. Search and add courses to start building your schedule.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {selectedCourses.map((course) => {
        const lecSections = course.components.filter((c) => c.type === "LEC");
        const labSections = course.components.filter((c) => c.type === "LAB" || c.type === "DIS");
        
        const selectedLec = selectedLectureSectionByCourseId[course.id];
        const selectedLab = selectedLabSectionByCourseId[course.id];

        return (
          <Card key={course.id} className="p-[12px] flex flex-col gap-[12px] border-portal-border hover:border-portal-blue transition-colors rounded-none">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-portal-text flex items-center gap-2 m-0 text-[16px]">
                  {course.id}
                  {course.credits && (
                    <span className="text-[12px] font-normal px-1.5 py-0.5 bg-portal-toolbar text-portal-text-secondary rounded-none">
                      {course.credits} Credits
                    </span>
                  )}
                </h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-portal-text-secondary hover:text-portal-danger hover:bg-portal-danger/10 -mt-1 -mr-1 h-8 w-8 rounded-none flex-shrink-0"
                  onClick={() => removeCourse(course.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[14px] text-portal-text-secondary font-bold leading-tight m-0">{course.title}</p>
              {course.description && (
                <p className="text-[12px] text-portal-text-secondary mt-0.5 leading-snug m-0">{course.description}</p>
              )}
              {course.prerequisites && (
                <div className="mt-1 flex flex-col gap-1 text-[12px] text-portal-text bg-portal-toolbar px-2 py-1 rounded-none border border-portal-border-light">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3 w-3" />
                    <span className="font-bold uppercase tracking-wider">Prereq:</span>
                  </div>
                  <span>{course.prerequisites}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 mt-1">
              {lecSections.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-portal-text-secondary uppercase tracking-wider">Lecture</label>
                  <div className="flex gap-2">
                    <div 
                      className="flex-1"
                      onClickCapture={(e) => {
                        if (isBlockingMode) {
                          e.stopPropagation();
                          e.preventDefault();
                          alert("Please turn off 'Blocking unwanted time' to schedule courses.");
                        }
                      }}
                    >
                      <Select
                        value={selectedLec || ""}
                        onChange={(e) => setLectureSection(course.id, e.target.value)}
                        className="w-full h-[34px]"
                        disabled={isBlockingMode}
                      >
                        <option value="">Not scheduled</option>
                        {lecSections.map((lec) => (
                          <option key={lec.id} value={lec.id}>
                            {lec.section} - {formatMeetingPattern(lec)}{lec.seatAvailable === "Full" ? " [FULL]" : lec.seatAvailable != null ? ` [${lec.seatAvailable} seats]` : ""}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <DraggableComponentChip courseId={course.id} type="LEC" />
                  </div>
                  {selectedLec && (() => {
                    const section = lecSections.find(l => l.id === selectedLec);
                    return section ? <SectionDetail section={section} /> : null;
                  })()}
                </div>
              )}

              {labSections.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-portal-text-secondary uppercase tracking-wider">Lab / Discussion</label>
                  <div className="flex gap-2">
                    <div 
                      className="flex-1"
                      onClickCapture={(e) => {
                        if (isBlockingMode) {
                          e.stopPropagation();
                          e.preventDefault();
                          alert("Please turn off 'Blocking unwanted time' to schedule courses.");
                        }
                      }}
                    >
                      <Select
                        value={selectedLab || ""}
                        onChange={(e) => setLabSection(course.id, e.target.value || null)}
                        className="w-full h-[34px]"
                        disabled={isBlockingMode}
                      >
                        <option value="">Not scheduled</option>
                        {labSections.map((lab) => (
                          <option key={lab.id} value={lab.id}>
                            {lab.section} - {formatMeetingPattern(lab)}{lab.seatAvailable === "Full" ? " [FULL]" : lab.seatAvailable != null ? ` [${lab.seatAvailable} seats]` : ""}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <DraggableComponentChip courseId={course.id} type="LAB" />
                  </div>
                  {selectedLab && (() => {
                    const section = labSections.find(l => l.id === selectedLab);
                    return section ? <SectionDetail section={section} /> : null;
                  })()}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function SectionDetail({ section }: { section: CourseComponent }) {
  const hasLeft = section.instructor || section.location;
  const hasRight = section.seatAvailable != null;
  if (!hasLeft && !hasRight) return null;

  return (
    <div className="flex gap-0 mt-2 px-1 border border-portal-border divide-x divide-portal-border">
      {/* Left column: instructor + location */}
      {hasLeft && (
        <div className="flex-1 flex flex-col justify-center gap-1.5 text-xs text-slate-500 py-2 pr-3 min-w-0">
          {section.instructor && (
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-1.5 min-w-0">
                <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                <span className="font-semibold text-slate-800 truncate">{section.instructor}</span>
                {section.rmpRating && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100 font-bold text-[10px] flex-shrink-0">
                    <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                    {section.rmpRating.toFixed(1)}
                  </div>
                )}
              </div>
              {section.rmpUrl && (
                <a
                  href={section.rmpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ku-500 hover:text-ku-700 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] flex-shrink-0 ml-1"
                >
                  RMP <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
          {section.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-slate-600 truncate">{section.location}</span>
            </div>
          )}
        </div>
      )}

      {/* Right column: seat availability */}
      {hasRight && (
        <div className={`flex-shrink-0 flex flex-col items-center justify-center py-2 ${hasLeft ? "pl-3 pr-2" : "flex-1"}`}>
          <Users className="h-3.5 w-3.5 text-slate-400 mb-0.5" />
          {section.seatAvailable === "Full" ? (
            <>
              <span className="text-portal-danger font-bold text-[13px] leading-tight">FULL</span>
              <span className="text-portal-danger text-[9px] leading-tight">no seats</span>
            </>
          ) : section.seatAvailable! <= 5 ? (
            <>
              <span className="text-amber-600 font-bold text-[16px] leading-tight">{section.seatAvailable}</span>
              <span className="text-amber-600 text-[9px] leading-tight">seats left</span>
            </>
          ) : (
            <>
              <span className="text-slate-700 font-bold text-[16px] leading-tight">{section.seatAvailable}</span>
              <span className="text-slate-400 text-[9px] leading-tight">seats</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DraggableComponentChip({ courseId, type }: { courseId: string; type: "LEC" | "LAB" }) {
  const isBlockingMode = useScheduleStore((s) => s.isBlockingMode);
  
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `drag-${courseId}-${type}`,
    data: { courseId, type },
    disabled: isBlockingMode,
  });

  const colorClasses = type === "LEC" 
    ? "bg-portal-blue text-white border-portal-blue hover:bg-portal-blue/90" 
    : "bg-portal-utility text-white border-portal-utility hover:bg-portal-utility/90";

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isBlockingMode) {
      alert("Please turn off 'Blocking unwanted time' to schedule courses.");
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onPointerDown={(e) => {
        handlePointerDown(e);
        if (listeners?.onPointerDown) {
          listeners.onPointerDown(e as any);
        }
      }}
      className={`text-[12px] px-3 h-[34px] rounded-portal-btn border ${isBlockingMode ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing"} font-bold flex items-center gap-1.5 transition-colors shadow-none ${colorClasses} ${
        isDragging ? "opacity-50" : ""
      }`}
      title={isBlockingMode ? "Disable blocking mode to schedule" : `Drag to schedule ${type}`}
    >
      <Calendar className="h-3.5 w-3.5" />
      <span className="uppercase tracking-tight">Schedule</span>
    </div>
  );
}
