export default function NotificationsPage(){

return(

<div className="studio-page">

<section className="studio-page-heading">

<h1>Notifications</h1>

<p>
Choose what you would like to hear about.
</p>

</section>

<div className="studio-panel">

<label>

<input type="checkbox" defaultChecked />

Project opportunities

</label>

<br/>

<label>

<input type="checkbox" defaultChecked />

Application updates

</label>

<br/>

<label>

<input type="checkbox" defaultChecked />

Messages

</label>

<br/>

<label>

<input type="checkbox"/>

Marketing emails

</label>

</div>

</div>

);

}