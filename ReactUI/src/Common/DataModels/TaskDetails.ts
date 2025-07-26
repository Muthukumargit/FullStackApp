interface TaskType{
  taskCode:string,
  taskType:string
}
interface assignedTo{
  userId:string,
  userName:string,

}
interface assignedBy{
  userId:string,
  userName:string
}
interface status{
  statusCd:string,
  status:string
}

export interface TaskDetails {
  taskType: string;
  taskDescription: string;
  taskName: string;
  assignedToUserId: string;
  addAdminUsers: boolean;
  dueDate: string;
}

export interface UpdateTaskDetails{
  ticketId:string;
  taskType: TaskType;
  taskDescription: string;
  taskName: string;
  assignedTo: assignedTo;
  addAdminUsers: boolean;
  dueDate: string;
  status:status;
  taskFeedback:string;
  taskFeedbackList:string;
  assignedBy:assignedBy
}