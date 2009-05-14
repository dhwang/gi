package org.generalinterface.test.selenium;

import java.net.URI;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;
import org.testng.annotations.Test;

/**
 * @author Jesse Costello-Good
 */
public class JsUnitTest {

  public static final int TIMEOUT = 1000 * 60 * 10;

  private final String host;
  private final int port;
  private final String environment;
  private final String pathPath;

  public JsUnitTest(String host, int port, String environment, String pathPath) {
    this.host = host;
    this.port = port;
    this.environment = environment;
    this.pathPath = pathPath;
  }

  @Test
  public void test() throws Exception {

    Selenium selenium = null;

    URI uri = new URI(pathPath);
    URI hostOnly = new URI(uri.getScheme(), uri.getUserInfo(), uri.getHost(), uri.getPort(), "", null, null);
    URI uriWithQuery = new URI(uri.getScheme(), uri.getUserInfo(), uri.getHost(), uri.getPort(),
        uri.getPath() + "jsunit/testRunner.html",
        "autoRun=true" +
            "&testpage=" + uri + "tests/suite.html" +
            "&submitresults=" + uri + "server/jsunithandler.php", null);

    try {
      selenium = new DefaultSelenium(host, port, environment, hostOnly.toString());
      selenium.start();

      selenium.open(uriWithQuery.toString());
      selenium.selectFrame("dom=window.top.mainFrame.mainStatus");
      selenium.setTimeout("" + TIMEOUT);

      // set timeout so that form has enough time to submit and return
      selenium.setSpeed("5000");
      selenium.waitForCondition("/Done/.test(window.top.mainFrame.mainStatus.document.getElementsByTagName('div')[0].innerHTML)", "" + TIMEOUT);

      // just to make sure selenium doesn't close
      selenium.selectFrame("dom=window.top.mainFrame.mainProgress");
    } finally {
      if (selenium != null)
        selenium.close();
    }

  }
}
