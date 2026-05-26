package com.samson

import com.facebook.react.modules.network.OkHttpClientFactory
import com.facebook.react.modules.network.OkHttpClientProvider
import java.net.Inet4Address
import java.net.InetAddress
import okhttp3.Dns
import okhttp3.OkHttpClient

/**
 * Android emulators often advertise broken IPv6 routes. OkHttp may try IPv6 first and
 * fail with "Network request failed" while Chrome still works. Prefer IPv4 addresses.
 */
class SamsonOkHttpFactory : OkHttpClientFactory {
  override fun createNewNetworkModuleClient(): OkHttpClient {
    return OkHttpClientProvider.createClientBuilder()
      .dns(Ipv4PreferDns)
      .build()
  }
}

private object Ipv4PreferDns : Dns {
  override fun lookup(hostname: String): List<InetAddress> {
    val all = InetAddress.getAllByName(hostname).toList()
    val ipv4 = all.filterIsInstance<Inet4Address>()
    return if (ipv4.isNotEmpty()) ipv4 else all
  }
}
