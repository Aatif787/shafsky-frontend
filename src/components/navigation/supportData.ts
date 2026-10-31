export interface ContactPhone {
  display: string;
  tel: string;
}

export interface ContactEmail {
  display: string;
  email: string;
}

export interface SupportDepartment {
  id: string;
  departmentNumber: number;
  title: string;
  categoryBadge: string;
  iconType: "ticketing" | "visa" | "gro";
  phones: ContactPhone[];
  emails: ContactEmail[];
}

/**
 * 3 Canonical Shafsky Aviation Support Departments
 * Exactly as specified by company communication standards.
 * Department 01 is Meet & Greet and Lounge.
 */
export const SUPPORT_DEPARTMENTS: SupportDepartment[] = [
  {
    id: "dept-1",
    departmentNumber: 1,
    title: "Meet & Greet and Lounge",
    categoryBadge: "Meet & Greet and Lounge",
    iconType: "gro",
    phones: [
      {
        display: "+91-9599087959",
        tel: "tel:+919599087959",
      },
      {
        display: "+91 95996 15459",
        tel: "tel:+919599615459",
      },
    ],
    emails: [
      {
        display: "Gro.shafskyaviation@gmail.com",
        email: "mailto:Gro.shafskyaviation@gmail.com",
      },
    ],
  },
  {
    id: "dept-2",
    departmentNumber: 2,
    title: "Air Ticketing, Event Management, Transportation & Hotels",
    categoryBadge: "Aviation & Logistics",
    iconType: "ticketing",
    phones: [
      {
        display: "+91-9599087957",
        tel: "tel:+919599087957",
      },
    ],
    emails: [
      {
        display: "shafskyaviation.social@gmail.com",
        email: "mailto:shafskyaviation.social@gmail.com",
      },
    ],
  },
  {
    id: "dept-3",
    departmentNumber: 3,
    title: "Visa Assistance, Air Ticketing, Hotels & General Inquiry",
    categoryBadge: "Visa & General Desks",
    iconType: "visa",
    phones: [
      {
        display: "+91 92175 22660",
        tel: "tel:+919217522660",
      },
    ],
    emails: [
      {
        display: "commercialshafskyaviation@gmail.com",
        email: "mailto:commercialshafskyaviation@gmail.com",
      },
    ],
  },
];
