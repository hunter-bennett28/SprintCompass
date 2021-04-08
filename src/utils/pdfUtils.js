import { jsPDF } from 'jspdf';

const setHeaderFont = (doc) => {
  doc.setFontSize(14);
  doc.setFont('Times', 'normal');
  return doc;
};

const setTaskFont = (doc) => {
  doc.setFontSize(14);
  doc.setFont('Times', 'italic');
  return doc;
};

const setSmallFont = (doc) => {
  doc.setFontSize(12);
  doc.setFont('Times', 'normal');
  return doc;
};

const abbreviate = (string, length) =>
  string?.length > length ? `${string.substring(0, length - 3)}...` : string;

const generateSprintPDF = (sprint) => {
  let depth = 0;
  // Create PDF object and get dimensions for formatting
  const doc = new jsPDF();
  //const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  // Create postiion consts using doc specs

  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  const leftIndent = 20;
  const assigneeIndent = pageWidth - 65;
  const workedIndent = pageWidth - 40;
  const remainingIndent = pageWidth - 20;

  // Print title
  doc.setFontSize(26);
  doc.setFont('Times', 'bold');
  doc.text(`Sprint ${sprint.iteration} Overview`, pageWidth / 2, (depth += 30), {
    align: 'center',
  });

  // Print logo
  const img = new Image();
  img.src = 'sprintcompass_logo.png';
  img.width = 417;
  img.height = 254;
  doc.addImage(
    img,
    'PNG',
    pageWidth / 2 - img.width * 0.03,
    (depth += 5),
    img.width * 0.06,
    img.height * 0.06
  );
  depth += img.height * 0.06;

  // Print sprint status
  setHeaderFont(doc).text(
    `Status: ${sprint.isLatest ? 'Ongoing' : 'Complete'}`,
    pageWidth / 2,
    (depth += 10),
    {
      align: 'center',
    }
  );

  // Print column headers
  setHeaderFont(doc).text('Task', leftIndent + 50, (depth += 15));
  doc.text('Assignee', assigneeIndent, depth, { align: 'center' });
  doc.text('Hours\nWorked', workedIndent - 2, depth - 3, { align: 'center' });
  doc.text('Hours\nLeft', remainingIndent - 1, depth - 3, { align: 'center' });

  // Print each user story and each subtask in sprint
  sprint.userStories?.forEach((story) => {
    // Print Stories
    setTaskFont(doc).text(abbreviate(story.task, 50), 20, (depth += 10));

    // Print subtasks, work done, and work left
    let totalWorked = 0;
    let totalLeft = 0;
    story.subtasks?.forEach((subtask) => {
      setSmallFont(doc).text(abbreviate(subtask.task, 45), leftIndent + 5, (depth += 6));
      doc.text(subtask.assigned?.substring(0, 20), assigneeIndent, depth, { align: 'center' });
      doc.text(subtask.hoursWorked?.toString(), workedIndent, depth, { align: 'right' });
      doc.text(
        subtask.hoursEstimated > -1 ? subtask.hoursEstimated?.toString() : '-',
        remainingIndent,
        depth,
        { align: 'right' }
      );
      totalWorked += subtask.hoursWorked;
      totalLeft += subtask.hoursEstimated > -1 ? subtask.hoursWorked : 0; // only increment set values
    });
    //story.subtasks.map()

    // Print totals for story
    setSmallFont(doc).text(
      `Total Worked: ${totalWorked}\tTotal Remaining: ${totalLeft}`,
      pageWidth - 20,
      (depth += 10),
      {
        align: 'right',
      }
    );
  });
  // Download the pdf
  doc.save(`${sprint.projectId}Sprint${sprint.iteration}`);
};

export default generateSprintPDF;
