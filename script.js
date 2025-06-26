document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthYearDisplay = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    const taskDescription = document.getElementById('taskDescription');

    let currentDate = new Date(); // Controls which month is displayed
    
    // Set activeDate to today's date, then normalize it to start of day
    let activeDate = new Date(); 
    activeDate.setHours(0, 0, 0, 0);

    // Function to calculate the start date for DSA Day 1
    // Your DSA Day 1 is 26/06/2025
    // Normalize dsaCycleStartDate to the start of the day
    const dsaCycleStartDate = new Date('2025-06-26T00:00:00');
    dsaCycleStartDate.setHours(0, 0, 0, 0);

    // If activeDate (today) is before the DSA cycle start, set it to the cycle start date
    if (activeDate.getTime() < dsaCycleStartDate.getTime()) {
        activeDate = new Date(dsaCycleStartDate); // Create a new Date object to avoid reference issues
    }
    
    // Align calendar display with activeDate's month and year
    currentDate.setDate(activeDate.getDate()); 
    currentDate.setMonth(activeDate.getMonth());
    currentDate.setFullYear(activeDate.getFullYear());

    function renderCalendar() {
        calendarGrid.innerHTML = `
            <div class="day-name">Sun</div>
            <div class="day-name">Mon</div>
            <div class="day-name">Tue</div>
            <div class="day-name">Wed</div>
            <div class="day-name">Thu</div>
            <div class="day-name">Fri</div>
            <div class="day-name">Sat</div>
        `; // Clear and re-add day names

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        currentMonthYearDisplay.textContent = new Date(year, month).toLocaleString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        // Get the number of days in the current month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Add empty cells for the days before the 1st of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('calendar-day', 'inactive');
            calendarGrid.appendChild(emptyDiv);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');
            
            // Create a date object for the current day being rendered and normalize
            const currentDayDate = new Date(year, month, day);
            currentDayDate.setHours(0, 0, 0, 0); 
            dayDiv.dataset.date = currentDayDate.toISOString().split('T')[0]; // Format YYYY-MM-DD

            const dateNumberSpan = document.createElement('span');
            dateNumberSpan.classList.add('date-number');
            dateNumberSpan.textContent = day;
            dayDiv.appendChild(dateNumberSpan);

            // Check if it's the current real-world day (normalized)
            const today = new Date();
            today.setHours(0, 0, 0, 0); 

            if (currentDayDate.getTime() === today.getTime()) {
                dayDiv.classList.add('current-day');
            }

            // Check if it's the active selected day (normalized)
            if (currentDayDate.getTime() === activeDate.getTime()) {
                dayDiv.classList.add('selected');
            }

            // Add a click listener to each day
            dayDiv.addEventListener('click', () => {
                // Remove 'selected' from previously selected day
                const previouslySelected = document.querySelector('.calendar-day.selected');
                if (previouslySelected) {
                    previouslySelected.classList.remove('selected');
                }
                // Add 'selected' to the newly clicked day
                dayDiv.classList.add('selected');
                // Update activeDate to the date of the clicked div (normalize it)
                activeDate = new Date(year, month, day);
                activeDate.setHours(0, 0, 0, 0);
                displayTaskForDate(activeDate);
            });

            // Add a task preview to the day cell
            const taskDetails = getTaskDetails(currentDayDate); // Get full details
            const taskPreviewSpan = document.createElement('span');
            taskPreviewSpan.classList.add('task-preview', taskDetails.className);
            taskPreviewSpan.innerHTML = taskDetails.previewText; // Use innerHTML for line breaks if needed
            dayDiv.appendChild(taskPreviewSpan);

            calendarGrid.appendChild(dayDiv);
        }
    }

    // This function now returns an object with preview text, a class, and full description
    function getTaskDetails(date) {
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

        // Normalize dates to ensure consistent day difference calculation
        const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const normalizedCycleStartDate = new Date(dsaCycleStartDate.getFullYear(), dsaCycleStartDate.getMonth(), dsaCycleStartDate.getDate());

        let previewText = '';
        let className = ''; // For CSS styling
        let fullDescription = '';

        if (normalizedDate.getTime() < normalizedCycleStartDate.getTime()) {
            previewText = "N/A";
            className = "none";
            fullDescription = "The DSA and Revision cycle starts from June 26, 2025. This date is before the cycle begins.";
        } else {
            // Calculate days passed since DSA cycle started
            const diffTime = normalizedDate.getTime() - normalizedCycleStartDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Use Math.floor for days passed

            // Determine the DSA/Revision task first
            let dsaRevisionPreview = '';
            let dsaRevisionDetail = '';
            const cycleDay = (diffDays % 5); // 0, 1, 2, 3, 4

            if (cycleDay === 4) { // 5th day of the cycle
                dsaRevisionPreview = "Revision";
                dsaRevisionDetail = "Today is your Revision day! Go through your revision notes and strengthen concepts. Don't forget to consolidate new learnings.";
                className = "revision"; // Default class for non-CodeChef days
            } else {
                // cycleDay will be 0, 1, 2, 3
                dsaRevisionPreview = `DSA Day ${cycleDay + 1}`;
                dsaRevisionDetail = `Today is DSA Day ${cycleDay + 1}. Focus on practicing Data Structures and Algorithms. Aim to solve specific problems or a topic.`;
                className = "dsa"; // Default class for non-CodeChef days
            }

            // Now handle Wednesday (CodeChef)
            if (dayOfWeek === 3) { // Wednesday
                previewText = `CodeChef<br><small>(${dsaRevisionPreview})</small>`; // Combine for preview
                fullDescription = `It's CodeChef DSA Round day! Be prepared for the round at 8 PM IST.<br><br>${dsaRevisionDetail}`; // Combine for full detail
                className = "codechef"; // Override class for CodeChef days
            } else {
                previewText = dsaRevisionPreview;
                fullDescription = dsaRevisionDetail;
            }
        }
        return { previewText, className, fullDescription };
    }


    function displayTaskForDate(date) {
        selectedDateDisplay.textContent = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const taskDetails = getTaskDetails(date); // Get the full task details
        
        // Apply a specific class for detailed display styling if needed
        let detailClass = '';
        if (taskDetails.className === 'dsa') detailClass = 'task-dsa-detail';
        else if (taskDetails.className === 'revision') detailClass = 'task-revision-detail';
        else if (taskDetails.className === 'codechef') detailClass = 'task-codechef-detail'; // CodeChef also gets its own detail class

        taskDescription.innerHTML = `<span class="${detailClass}">${taskDetails.fullDescription}</span>`;
    }

    // Event listeners for month navigation
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Initial render and display task for the active date
    renderCalendar();
    displayTaskForDate(activeDate); // Display task for the initially selected day
});