import requests
from bs4 import BeautifulSoup


URL = "https://classes.ku.edu/Classes/CourseSearch.action"
header = {
    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
     "Content-Type": "application/x-www-form-urlencoded"
}
def scrape_course(course_code):
    form_data = {
        "classesSearchText": "",
        "searchCareer": "Undergraduate",
        "searchTerm":"4252",
        "searchCourseNumberMin": "001",
        "searchCourseNumberMax":"999",
        "searchClosed": "false",
        "searchHonorsClasses":"false",
        "searchShortClasses":"false",
        "searchIncludeExcludeDays": "include"
    }
    response = requests.post(URL,headers= header, data=form_data)

    if response.status_code == 200:
        print("Successfully fetched!")
    else:
        print(f"Failed to fetch data: {response.status_code}")
    web_data = BeautifulSoup(response.text, "html.parser")
    tableExtract = web_data.table.find_all("tr", class_= None, id_ = None)
    i = 1
    classInfo = []
    course = {}
    for classSection in tableExtract:
        classList = []
        try:
            if i % 5 == 1:
                if classSection.h3:
                    courseCode = classSection.h3.getText(strip = True)
                    parts = courseCode.split(" ", 1)
                    course["id"] = courseCode
                    course["subject"] = parts[0] if len(parts) > 0 else ""
                    course["number"] = parts[1] if len(parts) > 1 else ""

                courseOtherInfo = classSection.td.contents[2].get_text(strip=True).split("\n")

                courseName = courseOtherInfo[0].strip()
                course["title"] = courseName

                creditHours = courseOtherInfo[3].strip()
                course["credits"] = int(creditHours) if creditHours.isdigit() else creditHours

                if len(courseOtherInfo) == 9:
                    course["semesterId"] = courseOtherInfo[8].strip()
                    course["honors"] = False
                elif len(courseOtherInfo) == 11:
                    course["semesterId"] = courseOtherInfo[10].strip()
                    course["honors"] = True
                elif len(courseOtherInfo) == 7:
                    course["semesterId"] = ""
                    course["honors"] = False
                else:
                    print(f"Abnormal course:{courseOtherInfo}")

            elif i % 5 == 2:
                courseDescriptionTag = classSection.td.getText(strip=True)
                if "Prerequisite:" in courseDescriptionTag:
                    courseDescription = courseDescriptionTag.split("Prerequisite:")[0].strip()
                if "Satisfies:" in courseDescriptionTag:
                    courseDescription = courseDescriptionTag.split("Satisfies:")[0].strip()
                course["description"] = courseDescription

                prerequisite = "N/A"
                corequisite = "N/A"
                satisfies = "N/A"

                if "Prerequisite:" in courseDescriptionTag:
                    prerequisite = courseDescriptionTag.split("Prerequisite:")[1].split("\n")[0].strip()
                    if "Corequisite" in prerequisite:
                        try:
                            prerequisite = prerequisite.split("Corequisite")[1].strip()
                        except Exception as e:
                            print(f"{prerequisite} with {e}")
                course["prerequisite"] = prerequisite

                if "Corequisite:" in courseDescriptionTag:
                    corequisite = courseDescriptionTag.split("Corequisite:")[1].split("\n")[0].strip()
                course["corequisite"] = corequisite

                if "Satisfies:" in courseDescriptionTag:
                    goalString = courseDescriptionTag.split("Satisfies:")[1].strip()
                    goals = goalString.split(",")
                    cleaned_goals = []
                    for goal in goals:
                        eachgoal = goal.split("\n")
                        eachgoal = [word.strip() for word in eachgoal if word.strip()]
                        cleaned_goals.append(" ".join(eachgoal))
                    satisfies = " & ".join(cleaned_goals)
                course["satisfies"] = satisfies

            elif i % 5 == 3:
                classTable = classSection.table.find_all("tr")

                classSchedule = {}
                classNumber = ""

                for row in classTable:
                    cols = row.find_all("td")

                    if len(cols) < 2:
                        continue

                    if cols[0].text.strip() in ["LEC", "LBN", "DIS", "LAB"]:
                        sectionType = cols[0].text.strip()
                        instructorTag = cols[1].find("a")
                        instructor = instructorTag.text.strip() if instructorTag else "Unknown"

                        topicTag = cols[1].contents[2].get_text(strip=True).split(":")
                        topic = topicTag[1].strip() if len(topicTag) > 1 else "N/A"

                        courseAttribute = "N/A"
                        courseAttributeTag = cols[2].contents
                        if len(courseAttributeTag) > 1:
                            if "src" in courseAttributeTag[1].attrs and courseAttributeTag[1]['src'] == "/Classes/img/book-icon-0.svg":
                                courseAttribute = "No Cost Course Materials"
                            else:
                                courseAttribute = "Low Cost Course Materials"

                        classNumber = cols[3].find("strong").text.strip()
                        seatAvailable = cols[4].text.strip()

                        classSchedule = {
                            "id": classNumber,
                            "type": sectionType,
                            "instructor": instructor,
                            "topic": topic,
                            "courseAttribute": courseAttribute,
                            "seatAvailable": seatAvailable,
                        }

                    elif "Notes" in cols[0].text.strip():
                        location = "OFF CMPS-K"
                        locationTag = cols[1].span

                        if locationTag:
                            if locationTag.find("img") or locationTag.get_text() == '':
                                continue
                            else:
                                locationText = locationTag.string.strip()
                                if locationText == "ONLNE CRSE":
                                    location = "Online"
                                elif locationText == "KULC APPT":
                                    location = "By Appointment"
                                else:
                                    campus = ''
                                    if len(cols[1].contents) == 11:
                                        campus = cols[1].contents[6].get_text(strip=True)
                                    elif len(cols[1].contents) == 15:
                                        campus = cols[1].contents[12].get_text(strip=True)

                                    classroom = locationTag.string.strip()
                                    location = classroom + " " + campus

                        Date = cols[1].contents[0].get_text(strip=True).split("\n")
                        Date = [str(date).strip() for date in Date]
                        meetingTime = None
                        if len(Date) > 2:
                            Date.pop(2)
                            meetingTime = " ".join(Date)
                        elif Date[0] == "APPT" and locationTag == "ONLNE CRSE":
                            try:
                                meetingTime = cols[1].find("strong").string
                            except:
                                meetingTime = None

                        classSchedule["meetingTime"] = meetingTime
                        classSchedule["location"] = location

                    if classNumber and "meetingTime" in classSchedule and "location" in classSchedule:
                        classList.append(classSchedule.copy())
                        classSchedule = {}
                        classNumber = ""

                course["components"] = classList

            elif i % 5 == 0:
                if course.get("satisfies") and course["satisfies"] != "N/A":
                    course["satisfied"] = [s.strip() for s in course["satisfies"].split(" & ")]
                classInfo.append(course.copy())
                course.clear()
            i += 1
        except Exception as e:
            print(f"Error with {classSection}: {e}")
            continue
    return classInfo
