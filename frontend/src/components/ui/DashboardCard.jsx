export default function DashboardCard({

    title,

    children,

}) {

    return (

        <div className="dashboard-card">

            <h3>

                {title}

            </h3>

            {children}

        </div>

    );

}