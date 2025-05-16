<% components.forEach(c => { %>
  <% if (c.type === 'input') { %>
    <label><%= c.label %></label>
    <input type="text" name="<%= c.name %>" />
  <% } else if (c.type === 'text') { %>
    <p><%= c.content %></p>
  <% } else if (c.type === 'button') { %>
    <button routerLink="<%= c.route %>"><%= c.label %></button>
  <% } %>
<% }); %>
