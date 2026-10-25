import { initLayout } from "../layout.js?v=202610251319";
import { allOrders } from "../orders.js?v=202610251319";
import { $, esc, pkr, formatDate } from "../utils.js?v=202610251319";

initLayout("orders.html");
const list = allOrders();
$("#ordersRoot").innerHTML = list.length
  ? `<ul class="order-list">${list.map((o) => `
      <li class="order-row">
        <div><b class="order-row__ref">${esc(o.ref)}</b><small>${esc(formatDate(o.createdAt))} · ${o.items.reduce((s, i) => s + i.qty, 0)} items</small></div>
        <span class="pill pill--wait">${esc(o.orderStatus)}</span>
        <span class="order-row__total">${pkr(o.total)}</span>
        <a class="btn btn--sm btn--pink" href="order.html?ref=${encodeURIComponent(o.ref)}">View &amp; invoice →</a>
      </li>`).join("")}</ul>
     <p class="fine" style="margin-top:20px">These are orders placed on this device and browser. The status shown is the status when the order was placed. We'll update you on WhatsApp.</p>`
  : `<div class="empty"><p class="empty__emoji" aria-hidden="true">🧾</p><h2>No orders on this device</h2><p>Orders you place in this browser will show up here. Ordered on another device? Message us on WhatsApp with your order reference.</p><a class="btn btn--pink btn--lg" href="shop.html">Shop slimes</a></div>`;
