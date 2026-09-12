# Faculty Web Platform

Glossary for the MCU Buddhasothorn faculty site: a public portal for visitors and an admin console for staff. Terms below are the canonical names. Implementation lives in feature modules, not here.

## Surfaces

**Portal**:
The public faculty site for guests. News, personnel, programs, facilities, admissions, helpdesk, and asset QR live here.
_Avoid_: Front office, website, homepage (unless meaning `/` only)

**Admin Console**:
The signed-in back office for staff workflows and master data.
_Avoid_: Dashboard (the `/dashboard` page is one screen inside this surface), CMS

## Tenancy and access

**Tenant**:
The faculty organization that owns every business record.
_Avoid_: Organization, faculty (when meaning the data partition)

**User**:
A login account with credentials. Not the same as a Personnel Profile.
_Avoid_: Account, member, staff (when meaning the login)

**Personnel Profile**:
A public directory record for a faculty or support person. May optionally link to one User.
_Avoid_: User, employee card, staff record

**Permission**:
A `module:action` grant checked before a mutation or admin page load.
_Avoid_: Role (a Role is a bundle of Permissions), access right

## Organization

**Department**:
An academic or office unit that groups Personnel Profiles, Academic Programs, and Asset Items.
_Avoid_: Faculty, school, org unit (except as an RBAC scope name)

## News

**News Article**:
A bilingual announcement with a tenant-unique slug and a publish status.
_Avoid_: Post, blog, content

**News Category**:
A tenant-scoped grouping for News Articles.
_Avoid_: Tag, topic

## Curriculum and admissions

**Academic Program**:
A degree or certificate offering with credits, duration, and an optional Department.
_Avoid_: Course (a Course is a line inside a program), major, curriculum (the module name, not one record)

**Curriculum Course**:
A subject row on an Academic Program, grouped by year and semester.
_Avoid_: Program, subject catalog

**Admission Round**:
A time-bounded intake window with quotas per Academic Program.
_Avoid_: Semester, application period (informal)

**Student Application**:
A person's submission to an Admission Round for one Academic Program.
_Avoid_: Form, registration

## Reservations

**Reservation Resource**:
A bookable room or vehicle.
_Avoid_: Facility (the portal path name), asset

**Reservation**:
A request to occupy a Reservation Resource for a time range.
_Avoid_: Booking (informal), appointment

## Documents

**Document Type**:
A reusable form definition for Document Requests.
_Avoid_: Template, form type

**Document Request**:
A numbered submission that moves through approval steps.
_Avoid_: Ticket (that is Maintenance), document (ambiguous)

## Assets

**Asset Item**:
A tagged capital item that can be transferred, repaired, or disposed.
_Avoid_: Equipment (informal), inventory (the module includes supplies too)

**Supply Item**:
A consumable stock line. Distinct from an Asset Item.
_Avoid_: Material, stock (ambiguous)

**Supply Requisition**:
A staff request to withdraw Supply Items. Moves PENDING → APPROVED → DISPATCHED (or REJECTED / CANCELLED). Stock is deducted only on dispatch.
_Avoid_: Purchase order, material request (informal)

## Maintenance

**Service Ticket**:
A helpdesk request with SLA, assignment, and an optional rating.
_Avoid_: Document Request, work order (informal)
